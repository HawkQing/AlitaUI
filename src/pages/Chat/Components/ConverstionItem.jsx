import { Box, Typography, useTheme } from '@mui/material';
import { StatusDot } from '../../../components/StatusDot';
import { PromptStatus } from '@/common/constants';
import UsersIcon from '@/components/Icons/UsersIcon';
import { useCallback, useMemo, useState } from 'react';
import DotMenu from "@/components/DotMenu";
import DeleteIcon from '../../../components/Icons/DeleteIcon';
import EditIcon from '@/components/Icons/EditIcon';
import StyledInputEnhancer from '@/components/StyledInputEnhancer';
import CheckedIcon from '@/components/Icons/CheckedIcon';
import CancelIcon from '@/components/Icons/CancelIcon';
import ExportIcon from '@/components/Icons/ExportIcon';
import OpenEyeIcon from '@/components/Icons/OpenEyeIcon';

const ConversationItem = ({ conversation = {}, onSelectConversation, isActive = false, onDelete, onExport, onEdit }) => {
  const { name, participants, is_public, chat_history = [] } = conversation
  const [conversationName, setConversationName] = useState(name)
  const [isHovering, setIsHovering] = useState(false)
  const theme = useTheme();
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const mainBodyWidth = useMemo(() => isHovering ? 'calc(100% - 56px)' : 'calc(100% - 24px)', [isHovering])
  const onClickConversation = useCallback(
    () => {
      onSelectConversation(conversation);
    },
    [conversation, onSelectConversation],
  )

  const handleDelete = useCallback(async () => {
    onDelete(conversation);
  }, [conversation, onDelete])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleMakePublic = useCallback(() => {
    if (!is_public) {
      onEdit({ ...conversation, is_public: true })
    }
  }, [conversation, is_public, onEdit])

  const menuItems = useMemo(() => {
    const items = [
      {
        label: 'Delete',
        icon: <DeleteIcon sx={{ fontSize: '1.13rem' }} />,
        alertTitle: 'Delete conversation?',
        confirmButtonTitle: 'Delete',
        confirmText: 'Are you sure to delete conversation? It can’t be restored.',
        onConfirm: handleDelete
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ fontSize: '1.13rem' }} />,
        onClick: handleEdit
      },
      {
        label: 'Export',
        icon: <ExportIcon sx={{ fontSize: '1.13rem' }} />,
        hasSubMenu: true,
        subMenuItems: [
          {
            label: 'Option1',
            onClick: onExport
          },
          {
            label: 'Option2',
            onClick: onExport
          }
        ],
        onClick: handleEdit
      },
      {
        label: 'Make public',
        icon: <OpenEyeIcon sx={{ fontSize: '1.13rem' }} />,
        alertTitle: 'Public conversation?',
        confirmButtonTitle: 'Make public',
        confirmText: 'Are you sure to make your conversation public?',
        confirmButtonSX: { 
          background: `${theme.palette.background.button.primary.default} !important`,
          color: `${theme.palette.text.button.primary} !important`
        },
        onConfirm: handleMakePublic
      }
    ]
    return is_public ? items.filter(item => item.label !== 'Make public') : items;
  }, [handleDelete, handleEdit, onExport, theme.palette.background.button.primary.default, theme.palette.text.button.primary, handleMakePublic, is_public]);

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

  const onCloseMenuList = useCallback(
    () => {
      setShowMenu(false)
    },
    [],
  )

  const onShowMenuList = useCallback(
    () => {
      setShowMenu(true)
    },
    [],
  )

  const onChangeConversationName = useCallback(
    (event) => {
      setConversationName(event.target.value)
    },
    [],
  )

  const onSave = useCallback(
    () => {
      setIsEditing(false);
      onEdit({ ...conversation, name: conversationName })
      setIsEditing(false);
    },
    [conversation, conversationName, onEdit],
  )

  const onCloseEdit = useCallback(
    () => {
      setConversationName(name);
      setIsEditing(false);
    },
    [name],
  )

  return !isEditing ? (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.border.lines}`,
        borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '0px solid',
        padding: '12px 16px',
        gap: '12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        height: '74px',
        boxSizing: 'border-box',
        background: isActive ? theme.palette.background.button.default : 'transparent',
        borderTopRightRadius: isActive ? '6px' : '0px',
        borderTopLeftRadius: isActive ? '6px' : '0px',
        borderBottomRightRadius: isActive ? '6px' : '0px',
        borderBottomLeftRadius: isActive ? '6px' : '0px',
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
            {name || chat_history[0]?.content || ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
          <UsersIcon />
          <Typography>
            {participants.length}
          </Typography>
        </Box>
      </Box>
      <Box id={'Menu'} sx={{ height: '100%', visibility: showMenu ? 'visible' : 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
        <DotMenu
          id='conversation-menu'
          menuIconSX={{ height: '100%', borderRadius: '6px' }}
          onClose={onCloseMenuList}
          onShowMenuList={onShowMenuList}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {menuItems}
        </DotMenu>
      </Box>
    </Box>
  ) :
    <Box sx={{
      width: '100%',
      height: '74px',
      borderRadius: '6px',
      padding: '12px 16px 13px 16px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '12px',
      background: theme.palette.background.conversationEditor
    }}>
      <StyledInputEnhancer
        autoComplete="off"
        maxRows={1}
        variant='standard'
        fullWidth
        label=''
        value={conversationName}
        onChange={onChangeConversationName}  //splice
        containerProps={{ display: 'flex', flex: 1 }}
      />
      <Box
        onClick={onSave}
        sx={{
          width: '24px',
          height: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '6px',
          cursor: 'pointer',
          boxSizing: 'border-box',
          paddingTop: '5px',
          paddingLeft: '5px',
          '&:hover': {
            background: theme.palette.background.select.hover
          }
        }}>
        <CheckedIcon sx={{ width: '20px', height: '20px' }} />
      </Box>
      <Box
        onClick={onCloseEdit}
        sx={{
          width: '24px',
          height: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '6px',
          cursor: 'pointer',
          boxSizing: 'border-box',
          paddingTop: '2px',
          paddingLeft: '2px',
          '&:hover': {
            background: theme.palette.background.select.hover
          }
        }}>
        <CancelIcon />
      </Box>
    </Box>
}

export default ConversationItem