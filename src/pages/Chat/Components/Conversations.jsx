import { Box, Typography } from '@mui/material';
import ConversationItem from './ConverstionItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import { useIsSmallWindow } from '@/pages/hooks';

const Conversations = ({ conversations, onSelectConversation, selectedConversationId, collapsed, onCollapsed }) => {
  const { isSmallWindow } = useIsSmallWindow();
  return (
    <Box >
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: (collapsed && !isSmallWindow) ? 'center' : 'space-between' }}>
        {
          (!collapsed || isSmallWindow) &&
          <Typography variant='subtitle'>
            Conversations
          </Typography>
        }
        {
          !isSmallWindow &&
          <Box sx={{ cursor: 'pointer' }} onClick={onCollapsed}>
            {!collapsed ? <DoubleLeftIcon width={16} /> : <DoubleRightIcon width={16} />}
          </Box>
        }
      </Box>
      <Box sx={{ marginTop: '20px', gap: '8px', display: collapsed ? 'none' : 'flex', flexDirection: 'column' }} >
        {
          conversations.map((conversation) => (
            <ConversationItem
              isActive={selectedConversationId === conversation.id}
              key={conversation.id}
              conversation={conversation}
              onSelectConversation={onSelectConversation}
              collapsed={collapsed && !isSmallWindow}
            />
          ))
        }
        {
          !conversations.length && <Typography variant='bodyMedium' color='text.button.disabled'>
            Still no conversations created
          </Typography>
        }
      </Box>
    </Box>

  )
}

export default Conversations