
import { Grid, Box, Typography } from '@mui/material';
import Conversations from './Components/Conversations';
import { useCallback, useState, useRef, useMemo } from 'react';
import { ChatBoxMode } from '@/common/constants';
import ChatBox from './Components/ChatBox';
import Participants from './Components/Participants';
import { useIsCreatingConversation } from '../hooks';
import { useSearchParams } from 'react-router-dom';
import { ActionButton } from '@/components/ChatBox/StyledComponents';
import ClearIcon from '../../components/Icons/ClearIcon';
import { stableSort } from '@/common/utils';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [activeParticipant, setActiveParticipant] = useState()
  const isCreatingConversation = useIsCreatingConversation();
  const [, setSearchParams] = useSearchParams();

  const onStartNewConversation = useCallback(
    (newConversation) => {
      const {
        id,
        name,
        is_public,
        participant,
        participant_type,
      } = newConversation;
      const newSearchParams = new URLSearchParams({});
      setSearchParams(newSearchParams, {
        replace: true,
      });
      setSelectedConversation({
        id,
        name,
        is_public,
        participants: {
          models: [],
          applications: [],
          datasources: [],
          prompts: [],
          [participant_type]: [participant]
        },
        chat_history: [],
      });
      const sortedConversations = stableSort([...conversations, {
        id,
        name,
        is_public,
        participants: {
          models: [],
          applications: [],
          datasources: [],
          prompts: [],
          [participant_type]: [participant]
        },
        chat_history: [],
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
  
  const settings = useMemo(() => ({
    chatOnly: true,
    type: ChatBoxMode.Chat,
    messageListSX: { height: 'calc(100vh - 250px)' },
    isNewConversation: isCreatingConversation,
    onStartNewConversation,
    activeParticipant,
    onClearActiveParticipant,
  }), [activeParticipant, isCreatingConversation, onClearActiveParticipant, onStartNewConversation]);
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
      setSelectedConversation(conversation);
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

  return (
    <>
      <Grid container sx={{ padding: '0.5rem 1.5rem' }} columnSpacing={'32px'}>
        <Grid item xs={12} lg={collapsedConversations ? 0.5 : 3}>
          <Conversations
            selectedConversationId={selectedConversation?.id}
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
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '12px'}}>
            <Typography variant='bodyMedium' color='secondary'>
            {
              selectedConversation?.name
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
          <Participants
            collapsed={collapsedParticipants}
            onCollapsed={onParticipantsCollapsed}
            activeParticipantId={activeParticipant?.id}
            participants={selectedConversation?.participants || {}}
            onSelectParticipant={onSelectParticipant} />
        </Grid>
      </Grid>
    </>
  )
}

export default Chat