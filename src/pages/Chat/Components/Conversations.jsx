import { Box, Typography } from '@mui/material';
import ConversationItem from './ConverstionItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import { useIsSmallWindow } from '@/pages/hooks';
import { useTheme } from '@emotion/react';

const Conversations = ({ conversations, onSelectConversation, selectedConversationId, collapsed, onCollapsed, onEditConversation }) => {
  const { isSmallWindow } = useIsSmallWindow();
  const theme = useTheme();
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
          <Box sx={{
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': {
              background: theme.palette.background.button.secondary.hover,
            },
          }} onClick={onCollapsed}>
            {!collapsed ? <DoubleLeftIcon width={16} /> : <DoubleRightIcon width={16} />}
          </Box>
        }
      </Box>
      <Box sx={{ marginTop: '8px', gap: '8px', display: collapsed ? 'none' : 'flex', flexDirection: 'column' }} >
        {
          conversations.map((conversation) => (
            <ConversationItem
              isActive={selectedConversationId === conversation.id}
              key={conversation.id}
              conversation={conversation}
              onSelectConversation={onSelectConversation}
              collapsed={collapsed && !isSmallWindow}
              onEdit={onEditConversation}
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