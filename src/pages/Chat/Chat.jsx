
import { Grid } from '@mui/material';
import Conversations from './Components/Conversations';
import { useCallback, useState, useRef } from 'react';
import { ChatBoxMode, ROLES } from '@/common/constants';
import ChatBox from '../../components/ChatBox/ChatBox';
import Participants from './Components/Participants';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const settings = {
    chatOnly: true,
    type: ChatBoxMode.Chat,
    messageListSX: { height: 'calc(100vh - 200px)' }
  };
  const [collapsed, setCollapsed] = useState(false);
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

  const onCollapsed = useCallback(
    () => {
      setCollapsed(prev => !prev)
    },
    [],
  )
  

  return (
    <Grid container sx={{ padding: '0.5rem 1.5rem' }} columnSpacing={'32px'}>
      <Grid item xs={12} lg={3}>
        <Conversations
          selectedConversationId={selectedConversation?.id}
          conversations={conversations}
          onSelectConversation={onSelectConversation}
        />
      </Grid>
      <Grid item xs={12} lg={collapsed ? 8.5 : 6} sx={{
        paddingTop: {
          xs: '32px',
          lg: '0px'
        }
      }}>
        <ChatBox {...settings} ref={boxRef} />
      </Grid>
      <Grid item xs={12} lg={collapsed ? 0.5 : 3}>
        <Participants
          collapsed={collapsed}
          onCollapsed={onCollapsed}
          selectedConversationId={selectedConversation?.id}
          participants={conversations}
          onSelectConversation={onSelectConversation} />
      </Grid>
    </Grid>

  )
}

export default Chat