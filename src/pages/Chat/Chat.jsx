
import { Grid, Box, Typography } from '@mui/material';
import Conversations from './Components/Conversations';
import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { ChatBoxMode, ChatParticipantType, ChatSearchEvents, NAV_BAR_HEIGHT } from '@/common/constants';
import ChatBox from './Components/ChatBox';
import Participants from './Components/Participants';
import { useIsCreatingConversation, useSelectedProjectId, useSortQueryParamsFromUrl } from '../hooks';
import { buildErrorMessage, stableSort } from '@/common/utils';
import ParticipantSettings from './Components/ParticipantSettings';
import eventEmitter from '@/common/eventEmitter';
import useResetCreateFlag from './Components/useResetCreateFlag';
import { v4 as uuidv4 } from 'uuid';
import { useConversationCreateMutation, useConversationListQuery, useLazyConversationDetailsQuery } from '@/api/chat';
import useToast from '@/components/useToast';

const Chat = () => {
  const projectId = useSelectedProjectId()
  const { ToastComponent: ApiToast, toastError } = useToast({ topPosition: '10px' });
  const { sort_by: sortBy, sort_order: sortOrder } = useSortQueryParamsFromUrl({ defaultSortOrder: 'desc', defaultSortBy: 'created_at' })
  const [page, setPage] = useState(0);
  const {
    data,
    isSuccess,
    isError: isLoadConversationListError,
    error: loadConversationListError,
    isLoading: isLoadConversations,
    isFetching: isLoadMoreConversations
  } = useConversationListQuery({
    projectId,
    page,
    params: {
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  }, { skip: !projectId })
  const [
    getConversationDetail,
    {
      isError: isQueryDetailError,
      error: queryDetailError,
      isFetching: isLoadingConversation
    }] = useLazyConversationDetailsQuery();
  const [conversations, setConversations] = useState([]);
  const conversationsRef = useRef(conversations)
  const [activeConversation, setActiveConversation] = useState({ name: '', chat_history: [], participants: [], is_private: true })
  const [activeParticipant, setActiveParticipant] = useState()
  const [isStreaming, setIsStreaming] = useState(false)
  const isCreatingConversation = useIsCreatingConversation();
  const [theParticipantEdited, setTheParticipantEdited] = useState()
  const [createConversation, { isError: isCreateError, error: createError }] = useConversationCreateMutation()
  const { resetCreateFlag } = useResetCreateFlag();

  const onLoadMoreConversations = useCallback(
    () => {
      if (data?.rows?.length && data?.total && data?.rows?.length < data?.total) {
        setPage(prev => prev + 1)
      }
    },
    [data?.rows?.length, data?.total],
  )

  useEffect(() => {
    if (isSuccess) {
      setConversations(data?.rows || []);
    }
  }, [data, data?.rows, isSuccess])

  useEffect(() => {
    if (isLoadConversationListError) {
      toastError(buildErrorMessage(loadConversationListError));
    }
  }, [loadConversationListError, isLoadConversationListError, toastError])

  useEffect(() => {
    if (isCreateError) {
      toastError(buildErrorMessage(createError));
    }
  }, [createError, isCreateError, toastError])

  useEffect(() => {
    if (isQueryDetailError) {
      toastError(buildErrorMessage(queryDetailError));
    }
  }, [queryDetailError, isQueryDetailError, toastError])

  const onChangeConversation = useCallback(
    (newConversation) => {
      const { participants } = newConversation;
      setActiveConversation(newConversation);
      setActiveParticipant(participants[0]);
    },
    [],
  )
  const onClearActiveParticipant = useCallback(
    () => {
      setActiveParticipant(undefined);
    },
    [],
  )

  const setChatHistory = useCallback(
    (chat_history) => {
      if (typeof chat_history === 'function') {
        setActiveConversation(prev => ({ ...prev, chat_history: chat_history(prev?.chat_history || []) }));
      } else {
        setActiveConversation(prev => ({ ...prev, chat_history }));
      }
    },
    [],
  )

  const onSelectNewParticipant = useCallback(
    (participant) => {
      if (!activeConversation?.participants.find(item => item.id === participant.id)) {
        setActiveConversation(prev => {
          const { participants, id } = prev;
          if (id) {
            if (participants.find(item => item.id === participant.id && item.type === ChatParticipantType.Prompts)) {
              return prev;
            } else {
              return {
                ...prev,
                participants: [...participants, participant]
              }
            }
          } else {
            return prev
          }
        });
        setConversations(prev => {
          return prev.map(conversation => {
            if (conversation.id === activeConversation?.id) {
              const { participants } = activeConversation;
              if (participants.find(item => item.id === participant.id && item.type === ChatParticipantType.Prompts)) {
                return activeConversation;
              } else {
                return {
                  ...activeConversation,
                  participants: [...participants, participant]
                }
              }
            } else {
              return conversation
            }
          })
        })
      }
    },
    [activeConversation],
  )

  const onCreateConversation = useCallback(
    async () => {
      const result = await createConversation({
        is_private: activeConversation.is_private,
        name: activeConversation.name,
        projectId,
      })
      setActiveConversation({
        ...activeConversation,
        ...result.data,
      });
      setConversations((prev) => {
        const sortedConversations = stableSort([...prev, activeConversation], (first, second) => {
          return first.name.toLowerCase().localeCompare(second.name.toLowerCase());
        })
        return sortedConversations
      });
      resetCreateFlag();
    },
    [activeConversation, createConversation, projectId, resetCreateFlag],
  )

  const settings = useMemo(() => ({
    chatOnly: true,
    type: ChatBoxMode.Chat,
    messageListSX: { height: 'calc(100vh - 250px)' },
    isCreatingConversation,
    activeParticipant,
    onClearActiveParticipant,
    activeConversation,
    setChatHistory,
    onChangeConversation,
    onSelectActiveParticipant: setActiveParticipant,
    setIsStreaming,
    onCreateConversation,
    isLoadingConversation,
  }), [
    activeConversation,
    activeParticipant,
    isCreatingConversation,
    onClearActiveParticipant,
    setChatHistory,
    onChangeConversation,
    onCreateConversation,
    isLoadingConversation
  ]);
  const [collapsedConversations, setCollapsedConversations] = useState(false);
  const [collapsedParticipants, setCollapsedParticipants] = useState(false);
  const chatBoxLgGridColumns = useMemo(() => {
    if (collapsedConversations && collapsedParticipants) {
      return 11;
    } else if (collapsedConversations || collapsedParticipants) {
      return 8.5
    } else {
      return 6
    }
  }, [collapsedConversations, collapsedParticipants])
  const boxRef = useRef();

  const onSelectConversation = useCallback(
    async (conversation) => {
      if (isCreatingConversation) {
        resetCreateFlag();
      }
      const result = await getConversationDetail({
        projectId,
        id: conversation.id
      })
      if (activeConversation?.id !== conversation.id) {
        setActiveConversation({
          ...conversation,
          ...result.data
        });
        setActiveParticipant(null)
      }
    },
    [activeConversation?.id, getConversationDetail, isCreatingConversation, projectId, resetCreateFlag],
  )

  const onSelectParticipant = useCallback(
    (participant) => {
      setActiveParticipant(participant);
    },
    [],
  )

  const onParticipantsCollapsed = useCallback(
    () => {
      setCollapsedParticipants(prev => !prev)
    },
    [],
  )

  const onConversationCollapsed = useCallback(
    () => {
      setCollapsedConversations(prev => !prev)
    },
    [],
  )

  const onShowSettings = useCallback(
    (theSelectedParticipant) => {
      setTheParticipantEdited(theSelectedParticipant);
    },
    [],
  )

  const onFinishEditParticipant = useCallback(
    (editedParticipant) => {
      //TODO Save editedParticipant
      setActiveConversation(prev => {
        return {
          ...prev,
          participants: prev.participants.map(participant => participant.id === editedParticipant.id ? editedParticipant : participant)
        }
      });
      setConversations(prev => {
        return prev.map(conversation => conversation.id === activeConversation?.id ? ({
          ...activeConversation,
          participants: activeConversation?.participants?.map(participant => participant.id === editedParticipant.id ? editedParticipant : participant)
        }) : conversation)
      })
      setTheParticipantEdited(undefined);
    },
    [activeConversation],
  )

  const onDeleteParticipant = useCallback(
    (id) => {
      //TODO delete editedParticipant
      setActiveConversation(prev => {
        return {
          ...prev,
          participants: prev.participants.filter(participant => participant.id !== id)
        }
      });
      setConversations(prev => {
        return prev.map(conversation => conversation.id === activeConversation?.id ? ({
          ...activeConversation,
          participants: activeConversation?.participants?.filter(participant => participant.id === id)
        }) : conversation)
      })
      setTheParticipantEdited(undefined);
      if (activeParticipant?.id === id) {
        setActiveParticipant();
      }
    },
    [activeConversation, activeParticipant?.id],
  )

  const onSelectParticipantFromSearch = useCallback(
    async ({ type, participant }) => {
      if (!activeConversation?.id) {
        return;
      }
      onSelectNewParticipant(type !== ChatParticipantType.Models ? {
        type,
        id: participant.id,
        name: participant.name,
        shouldUpdateDetail: true,
      } : participant)
    },
    [activeConversation?.id, onSelectNewParticipant],
  )

  const onEditConversation = useCallback(
    (conversation) => {
      if (conversation.id === activeConversation?.id) {
        setActiveConversation(conversation);
      }
      setConversations(prev => {
        return prev.map(item => conversation.id === item.id ? conversation : item)
      })
    },
    [activeConversation],
  )

  const onDeleteConversation = useCallback(
    (conversation) => {
      if (conversation.id === activeConversation?.id) {
        setActiveConversation(null);
        resetCreateFlag();
      }
      setConversations(prev => {
        return prev.filter(item => conversation.id !== item.id)
      })
    },
    [activeConversation?.id, resetCreateFlag],
  )

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    setConversations(conversationsRef.current.map(conversation => conversation.id === activeConversation?.id ? { ...activeConversation } : conversation))
  }, [activeConversation])

  useEffect(() => {
    eventEmitter.on(ChatSearchEvents.SelectParticipant, onSelectParticipantFromSearch)
    return () => {
      eventEmitter.off(ChatSearchEvents.SelectParticipant, onSelectParticipantFromSearch)
    }
  }, [onSelectParticipantFromSearch])

  useEffect(() => {
    if (isCreatingConversation && !isStreaming) {
      const newConversation = {
        id: uuidv4(),
        name: 'New Conversation',
        is_private: true,
        participants: [],
        chat_history: [],
      }
      setActiveConversation(newConversation);
      setActiveParticipant()
    }
  }, [isCreatingConversation, isStreaming])

  return (
    <>
      <Grid container sx={{
        padding: '0.5rem 1.5rem',
        boxSizing: 'border-box',
        height: `calc(100vh - ${NAV_BAR_HEIGHT})`,
        marginLeft: 0,
        width: '100%',
      }}>
        <Grid item xs={12} lg={collapsedConversations ? 0.5 : 3} sx={{
          height: '100%',
          boxSizing: 'border-box',
          paddingRight: {
            lg: '16px'
          }
        }}>
          <Conversations
            isLoadConversations={isLoadConversations}
            isLoadMoreConversations={isLoadMoreConversations}
            selectedConversationId={activeConversation?.id}
            conversations={conversations}
            onSelectConversation={onSelectConversation}
            onEditConversation={onEditConversation}
            onDeleteConversation={onDeleteConversation}
            collapsed={collapsedConversations}
            onCollapsed={onConversationCollapsed}
            onLoadMore={onLoadMoreConversations}
          />
          <ApiToast />
        </Grid>
        <Grid item xs={12} lg={chatBoxLgGridColumns} sx={{
          height: '100%',
          boxSizing: 'border-box',
          paddingRight: {
            lg: '8px'
          },
          paddingLeft: {
            lg: '8px'
          },
          paddingTop: {
            xs: '32px',
            lg: '0px'
          },
          gap: '12px'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', justifyContent: 'space-between' }}>
            <ChatBox {...settings} ref={boxRef} />
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant='bodySmall' color='text.button.disabled'>
                {"Mention symbols: / - prompt, # - datasource, @ - application, > - model"}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={collapsedParticipants ? 0.5 : 3} sx={{
          height: '100%',
          boxSizing: 'border-box',
          paddingLeft: {
            lg: '16px'
          },
        }} >
          {
            !theParticipantEdited ?
              <Participants
                collapsed={collapsedParticipants}
                onCollapsed={onParticipantsCollapsed}
                activeParticipantId={activeParticipant?.id}
                participants={activeConversation?.participants || []}
                onShowSettings={onShowSettings}
                onDeleteParticipant={onDeleteParticipant}
                onSelectParticipant={onSelectParticipant}
                onUpdateParticipant={onFinishEditParticipant}
              />
              :
              <ParticipantSettings
                participant={theParticipantEdited}
                onBackAndSave={onFinishEditParticipant}
                isActive={activeParticipant?.id === theParticipantEdited?.id}
                onDelete={onDeleteParticipant}
              />
          }
        </Grid>
      </Grid>
    </>
  )
}

export default Chat