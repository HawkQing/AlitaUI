import { Box, Typography } from '@mui/material';
import ConversationItem from './ConverstionItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import { useIsSmallWindow } from '@/pages/hooks';
import { useTheme } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { debounce } from '@/common/utils';

const Conversations = ({
  conversations,
  onSelectConversation,
  selectedConversationId,
  collapsed,
  onCollapsed,
  onEditConversation,
  onDeleteConversation,
  onLoadMore,
}) => {
  const { isSmallWindow } = useIsSmallWindow();
  const theme = useTheme();
  const listRef = useRef(null);

  const onScroll = debounce(() => {
    const listDom = listRef.current;
    const clientHeight = listDom.clientHeight;
    const scrollHeight = listDom.scrollHeight;
    const scrollTop = listDom.scrollTop;

    const isReachBottom = scrollTop + clientHeight > scrollHeight - 10
    if (isReachBottom && onLoadMore) {
      onLoadMore();
    }
  }, 300)

  useEffect(() => {
    if (listRef.current) {
      const listDom = listRef.current;
      listDom.addEventListener('scroll', onScroll);

      return () => {
        listDom.removeEventListener('scroll', onScroll);
      };
    }
  }, [onScroll, listRef]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: (collapsed && !isSmallWindow) ? 'center' : 'space-between', height: '32px', alignItems: 'center' }}>
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
      <Box
        ref={listRef}
        sx={{
          marginTop: '8px',
          gap: '8px',
          display: collapsed ? 'none' : 'flex',
          flexDirection: 'column',
          overflowY: 'scroll',
          maxHeight: `calc(100% - 40px)`,
          paddingBottom: '32px'
        }} >
        {
          conversations.map((conversation) => (
            <ConversationItem
              isActive={selectedConversationId === conversation.id}
              key={conversation.id}
              conversation={conversation}
              onSelectConversation={onSelectConversation}
              collapsed={collapsed && !isSmallWindow}
              onEdit={onEditConversation}
              onDelete={onDeleteConversation}
            />
          ))
        }
        {
          !conversations.length && <Typography variant='bodyMedium' color='text.button.disabled'>
            Still no conversations created
          </Typography>
        }
      </Box>
      <Box sx={{ width: '100%', height: '40px', position: 'absolute', bottom: '0px', left: '0px', background: theme.palette.background.conversationBottomCover }} />
    </Box>

  )
}

export default Conversations