
import { Grid, Box, Typography } from '@mui/material';
import Conversations from './Components/Conversations';
import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { ChatBoxMode } from '@/common/constants';
import ChatBox from './Components/ChatBox';
import Participants from './Components/Participants';
import { useIsCreatingConversation } from '../hooks';
import { useSearchParams } from 'react-router-dom';
import { ActionButton } from '@/components/ChatBox/StyledComponents';
import ClearIcon from '../../components/Icons/ClearIcon';
import { stableSort } from '@/common/utils';
import ParticipantSettings from './Components/ParticipantSettings';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const conversationsRef = useRef(conversations)
  const [activeConversation, setActiveConversation] = useState({ chat_history: [] })
  const [activeParticipant, setActiveParticipant] = useState()
  const isCreatingConversation = useIsCreatingConversation();
  const [theParticipantEdited, setTheParticipantEdited] = useState()
  const [, setSearchParams] = useSearchParams();

  const onStartNewConversation = useCallback(
    (newConversation) => {
      const {
        id = new Date().getTime(),
        name,
        is_public,
        participant,
        chat_history,
      } = newConversation;
      const newSearchParams = new URLSearchParams({});
      setSearchParams(newSearchParams, {
        replace: true,
      });
      setActiveConversation({
        id,
        name,
        is_public,
        participants: [participant],
        chat_history,
      });
      const sortedConversations = stableSort([...conversations, {
        id,
        name,
        is_public,
        participants: [participant],
        chat_history,
      }], (first, second) => {
        return first.name.toLowerCase().localeCompare(second.name.toLowerCase());
      })
      setConversations(sortedConversations);
      setActiveParticipant(participant);
    },
    [conversations, setSearchParams],
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

  const settings = useMemo(() => ({
    chatOnly: true,
    type: ChatBoxMode.Chat,
    messageListSX: { height: 'calc(100vh - 250px)' },
    isNewConversation: isCreatingConversation,
    onStartNewConversation,
    activeParticipant,
    onClearActiveParticipant,
    activeConversation,
    setChatHistory
  }), [
    activeConversation,
    activeParticipant,
    isCreatingConversation,
    onClearActiveParticipant,
    onStartNewConversation,
    setChatHistory
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
      setActiveConversation(conversation);
      setActiveParticipant(null)
    },
    [],
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
 
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    setConversations(conversationsRef.current.map(conversation => conversation.id === activeConversation.id ? { ...activeConversation } : conversation))
  }, [activeConversation])

  return (
    <>
      <Grid container sx={{ padding: '0.5rem 1.5rem' }} columnSpacing={'32px'}>
        <Grid item xs={12} lg={collapsedConversations ? 0.5 : 3}>
          <Conversations
            selectedConversationId={activeConversation?.id}
            conversations={conversations}
            onSelectConversation={onSelectConversation}
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
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Typography variant='bodyMedium' color='secondary'>
              {
                activeConversation?.name
              }
            </Typography>
            <ActionButton
              aria-label="clear the chat"
              disabled={false}
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => {
                boxRef.current?.onClear();
              }}
              sx={{ height: '28px', width: '28px' }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </ActionButton>
          </Box>
          <ChatBox {...settings} ref={boxRef} />
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