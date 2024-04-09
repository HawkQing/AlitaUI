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
            {!collapsed ? <DoubleLeftIcon width={'16px'} /> : <DoubleRightIcon width={'16px'} />}
          </Box>
        }
      </Box>
      <Box sx={{ marginTop: '20px', gap: (!collapsed || isSmallWindow) ? '0': '8px', display: 'flex', flexDirection: 'column'  }} >
        {
          conversations.map((conversation) => (
            <ConversationItem
              isSelected={selectedConversationId === conversation.id}
              key={conversation.id}
              conversation={conversation}
              onSelectConversation={onSelectConversation}
              collapsed={collapsed && !isSmallWindow}
            />
          ))
        }
      </Box>
    </Box>

  )
}

export default Conversations