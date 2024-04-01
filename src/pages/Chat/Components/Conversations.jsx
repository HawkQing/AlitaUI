import { Box, Typography } from '@mui/material';
import ConversationItem from './ConverstionItem';

const Conversations = ({ conversations, onSelectConversation, selectedConversationId }) => {

  return (
    <Box >
      <Typography variant='subtitle'>
        Conversations
      </Typography>
      <Box sx={{ marginTop: '20px' }} >
        {
          conversations.map((conversation) => (
            <ConversationItem
              isSelected={selectedConversationId === conversation.id}
              key={conversation.id}
              conversation={conversation}
              onSelectConversation={onSelectConversation}
            />
          ))
        }
      </Box>
    </Box>

  )
}

export default Conversations