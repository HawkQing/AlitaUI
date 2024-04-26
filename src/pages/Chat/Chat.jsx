
import { Grid, Box, Typography } from '@mui/material';
import Conversations from './Components/Conversations';
import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { ChatBoxMode, ChatParticipantType, ChatSearchEvents } from '@/common/constants';
import ChatBox from './Components/ChatBox';
import Participants from './Components/Participants';
import { useIsCreatingConversation, useSelectedProjectId } from '../hooks';
import { stableSort } from '@/common/utils';
import ParticipantSettings from './Components/ParticipantSettings';
import eventEmitter from '@/common/eventEmitter';
import { useLazyGetPromptQuery } from '@/api/prompts';
import { useLazyApplicationDetailsQuery } from '@/api/applications';
import { useLazyDatasourceDetailsQuery } from '@/api/datasources';

const Chat = () => {
  const projectId = useSelectedProjectId();
  const [conversations, setConversations] = useState([]);
  const conversationsRef = useRef(conversations)
  const [activeConversation, setActiveConversation] = useState({ chat_history: [], participants: [], is_public: false })
  const [activeParticipant, setActiveParticipant] = useState()
  const isCreatingConversation = useIsCreatingConversation();
  const [theParticipantEdited, setTheParticipantEdited] = useState()
  const [getPromptDetail] = useLazyGetPromptQuery();
  const [getApplicationDetail] = useLazyApplicationDetailsQuery();
  const [getDatasourceDetail] = useLazyDatasourceDetailsQuery();

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
        setActiveConversation(prev => ({ ...prev, chat_history: chat_history(prev.chat_history) }));
      } else {
        setActiveConversation(prev => ({ ...prev, chat_history }));
      }
    },
    [],
  )

  const onSelectNewParticipant = useCallback(
    (participant) => {
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
          if (conversation.id === activeConversation.id) {
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
    },
    [activeConversation],
  )

  const settings = useMemo(() => ({
    chatOnly: true,
    type: ChatBoxMode.Chat,
    messageListSX: { height: 'calc(100vh - 250px)' },
    isNewConversation: isCreatingConversation,
    activeParticipant,
    onClearActiveParticipant,
    activeConversation,
    setChatHistory,
    onChangeConversation,
    onSelectActiveParticipant: setActiveParticipant,
  }), [
    activeConversation,
    activeParticipant,
    isCreatingConversation,
    onClearActiveParticipant,
    setChatHistory,
    onChangeConversation
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
    (conversation) => {
      if (activeConversation.id !== conversation.id) {
        setActiveConversation(conversation);
        setActiveParticipant(null)
      }
    },
    [activeConversation.id],
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
        return prev.map(conversation => conversation.id === activeConversation.id ? ({
          ...activeConversation,
          participants: activeConversation.participants?.map(participant => participant.id === editedParticipant.id ? editedParticipant : participant)
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
        return prev.map(conversation => conversation.id === activeConversation.id ? ({
          ...activeConversation,
          participants: activeConversation.participants?.filter(participant => participant.id === id)
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
      if (!activeConversation.id) {
        return;
      }
      switch (type) {
        case ChatParticipantType.Prompts:
          {
            const result = await getPromptDetail({ projectId, promptId: participant.id })
            const promptDetail = result?.data || {};
            onSelectNewParticipant({
              type: ChatParticipantType.Prompts,
              id: participant.id,
              name: promptDetail.name,
              version_id: promptDetail.version_details.id,
              version_details: promptDetail.version_details,
              versions: promptDetail.versions
            })
          }
          break;
        case ChatParticipantType.Applications:
          {
            const result = await getApplicationDetail({ projectId, applicationId: participant.id })
            const applicationDetail = result?.data || {};
            onSelectNewParticipant({
              type: ChatParticipantType.Applications,
              id: participant.id,
              name: applicationDetail.name,
              version_id: applicationDetail.version_details.id,
              version_details: applicationDetail.version_details,
              versions: applicationDetail.versions
            })
          }
          break;
        case ChatParticipantType.Datasources:
          {
            const result = await getDatasourceDetail({ projectId, datasourceId: participant.id })
            const datasourceDetail = result?.data || {};
            onSelectNewParticipant({
              type: ChatParticipantType.Datasources,
              id: participant.id,
              name: datasourceDetail.name,
              description: datasourceDetail.description,
              version_id: datasourceDetail.version_details.id,
              version_details: datasourceDetail.version_details,
              versions: datasourceDetail.versions
            })
          }
          break;
        default:
          break;
      }

    },
    [activeConversation.id, getApplicationDetail, getDatasourceDetail, getPromptDetail, onSelectNewParticipant, projectId],
  )

  const onEditConversation = useCallback(
    (conversation) => {
      if (conversation.id === activeConversation.id) {
        setActiveConversation(conversation);
      }
      setConversations(prev => {
        return prev.map(item => conversation.id === item.id ? conversation : item)
      })
    },
    [activeConversation],
  )

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    setConversations(conversationsRef.current.map(conversation => conversation.id === activeConversation.id ? { ...activeConversation } : conversation))
  }, [activeConversation])

  useEffect(() => {
    eventEmitter.on(ChatSearchEvents.SelectParticipant, onSelectParticipantFromSearch)
    return () => {
      eventEmitter.off(ChatSearchEvents.SelectParticipant, onSelectParticipantFromSearch)
    }
  }, [onSelectParticipantFromSearch])

  useEffect(() => {
    if (isCreatingConversation) {
      const newConversation = {
        id: new Date().getTime(),
        name: 'New Conversation',
        is_public: false,
        participants: [{ type: ChatParticipantType.Models }],
        chat_history: [],
      }
      setActiveConversation(newConversation);
      setActiveParticipant()

      setConversations((prev) => {
        const sortedConversations = stableSort([...prev, newConversation], (first, second) => {
          return first.name.toLowerCase().localeCompare(second.name.toLowerCase());
        })
        return sortedConversations
      });
    }
  }, [isCreatingConversation])

  return (
    <>
      <Grid container sx={{ padding: '0.5rem 1.5rem' }} columnSpacing={'32px'}>
        <Grid item xs={12} lg={collapsedConversations ? 0.5 : 3}>
          <Conversations
            selectedConversationId={activeConversation?.id}
            conversations={conversations}
            onSelectConversation={onSelectConversation}
            onEditConversation={onEditConversation}
            collapsed={collapsedConversations}
            onCollapsed={onConversationCollapsed}
          />
        </Grid>
        <Grid item xs={12} lg={chatBoxLgGridColumns} sx={{
          paddingTop: {
            xs: '32px',
            lg: '0px'
          },
          gap: '12px'
        }}>
          <ChatBox {...settings} ref={boxRef} />
          <Box sx={{ marginTop: '5px' }}>
            <Typography variant='bodySmall' color='text.button.disabled'>
              {"Mention symbols: / - prompt, # - datasource, @ - application, > - model"}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} lg={collapsedParticipants ? 0.5 : 3}>
          {
            !theParticipantEdited ?
              <Participants
                collapsed={collapsedParticipants}
                onCollapsed={onParticipantsCollapsed}
                activeParticipantId={activeParticipant?.id}
                participants={activeConversation?.participants || []}
                onShowSettings={onShowSettings}
                onSelectParticipant={onSelectParticipant} />
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