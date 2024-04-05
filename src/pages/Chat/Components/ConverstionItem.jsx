import { Box, Typography, useTheme } from '@mui/material';
import { StatusDot } from '../../../components/StatusDot';
import { PromptStatus } from '@/common/constants';
import UsersIcon from '@/components/Icons/UsersIcon';
import { useCallback, useMemo, useState } from 'react';
import DotMenu from "@/components/DotMenu";
import DeleteIcon from '../../../components/Icons/DeleteIcon';

const ConversationItem = ({ conversation = {}, onSelectConversation, isSelected = false }) => {
  const { participants, is_public, chat_history = [] } = conversation
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const mainBodyWidth = useMemo(() => isHovering ? 'calc(100% - 56px)' : 'calc(100% - 24px)', [isHovering])
  const onClickConversation = useCallback(
    () => {
      onSelectConversation(conversation);
    },
    [conversation, onSelectConversation],
  )

  const handleDelete = useCallback(async () => {

  }, [])

  const menuItems = useMemo(() => {
    const items = [
      {
        label: 'Delete',
        icon: <DeleteIcon sx={{ fontSize: '1.13rem' }} />,
        confirmText: 'Are you sure to delete this conversation?',
        onConfirm: handleDelete
      }
    ]
    return items
  }, [handleDelete]);

  const onMouseEnter = useCallback(
    () => {
      setIsHovering(true);
    },
    [],
  )

  const onMouseLeave = useCallback(
    () => {
      setIsHovering(false);
    },
    [],
  )
  
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.border.lines}`,
        padding: '12px 16px',
        gap: '12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
        background: isSelected ? theme.palette.background.button.default : 'transparent',
        borderTopRightRadius: isSelected ? '6px' : '0px',
        borderTopLeftRadius: isSelected ? '6px' : '0px',
        borderBottomRightRadius: isSelected ? '6px' : '0px',
        borderBottomLeftRadius: isSelected ? '6px' : '0px',
        ':hover': {
          background: theme.palette.background.userInputBackground,
          borderTopRightRadius: '6px',
          borderTopLeftRadius: '6px',
          borderBottomRightRadius: '6px',
          borderBottomLeftRadius: '6px',
        },
        '&:hover #Menu': {
          visibility: 'visible',
        },
      }}
      onClick={onClickConversation}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Box sx={{ width: '16px' }}>
        <StatusDot size='10px' status={is_public ? PromptStatus.Published : PromptStatus.Draft} />
      </Box>
      <Box sx={{ width: mainBodyWidth }}>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            component='div'
            variant='bodyMedium'
            olor='text.secondary'>
            {chat_history[0]?.content || ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
          <UsersIcon />
          <Typography>
            {participants?.length || 0}
          </Typography>
        </Box>
      </Box>
      <Box id={'Menu'} sx={{ height: '100%', visibility: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
        <DotMenu
          id='conversation-menu'
          menuIconSX={{ height: '100%' }}
        >
          {menuItems}
        </DotMenu>
      </Box>
    </Box>
  )
}

export default ConversationItem