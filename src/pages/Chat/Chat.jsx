
import { Grid } from '@mui/material';
import Conversations from './Components/Conversations';
import { useCallback, useState, useRef, useMemo } from 'react';
import { ChatBoxMode, ROLES } from '@/common/constants';
import ChatBox from './Components/ChatBox';
import Participants from './Components/Participants';
import { useIsCreatingConversation } from '../hooks';
// import CreateConversationDialog from './Components/CreateConversationDialog';
import { useSearchParams } from 'react-router-dom';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const isCreatingConversation = useIsCreatingConversation();
  const [, setSearchParams] = useSearchParams();

  const onStartNewConversation = useCallback(
    // eslint-disable-next-line no-unused-vars
    (_newConversation) => {
      const newSearchParams = new URLSearchParams({});
      setSearchParams(newSearchParams, {
        replace: true,
      });
    },
    [setSearchParams],
  )
  const settings = useMemo(() => ({
    chatOnly: true,
    type: ChatBoxMode.Chat,
    messageListSX: { height: 'calc(100vh - 200px)' },
    isNewConversation: isCreatingConversation,
    onStartNewConversation
  }), [isCreatingConversation, onStartNewConversation]);
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

  const conversations = [
    {
      id: 1,
      participants: [1, 2, 3],
      is_public: false,
      chat_history: [
        {
          role: ROLES.User,
          content: 'Hi, you are a senior ReactJS developer, tell me what is fiber'
        }
      ]
    },
    {
      id: 2,
      participants: [1, 2],
      is_public: true,
      chat_history: [
        {
          role: ROLES.User,
          content: 'Hi, you are a senior ReactJS developer, tell me what is fiber'
        }
      ]
    },
    {
      id: false,
      participants: [1, 2, 3, 4],
      is_public: false,
      chat_history: [
        {
          role: ROLES.User,
          content: 'Hi, you are a senior ReactJS developer, tell me what is fiber'
        }
      ]
    },
    {
      id: 4,
      participants: [1, 2, 3, 4],
      is_public: true,
      chat_history: [
        {
          role: ROLES.User,
          content: 'Hi, you are a senior ReactJS developer, tell me what is fiber'
        }
      ]
    },
    {
      id: 5,
      participants: [1, 2, 3, 4],
      is_public: false,
      chat_history: [
        {
          role: ROLES.User,
          content: 'Hi, you are a senior ReactJS developer, tell me what is fiber'
        }
      ]
    }

  ]

  const onSelectConversation = useCallback(
    (conversation) => {
      setSelectedConversation(conversation);
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
          }
        }}>
          <ChatBox {...settings} ref={boxRef} />
        </Grid>
        <Grid item xs={12} lg={collapsedParticipants ? 0.5 : 3}>
          <Participants
            collapsed={collapsedParticipants}
            onCollapsed={onParticipantsCollapsed}
            selectedConversationId={selectedConversation?.id}
            participants={conversations}
            onSelectConversation={onSelectConversation} />
        </Grid>
      </Grid>
      {/* <CreateConversationDialog
        open={!!isCreatingConversation}
        onClose={onCloseCreation}
        onCreateNewConversation={onCreateNewConversation}
      /> */}
    </>
  )
}

export default Chat