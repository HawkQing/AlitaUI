import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { styled } from '@mui/material/styles';

import { useSelector } from 'react-redux';
import UserAvatar from '@/components/UserAvatar';
import CopyIcon from '../Icons/CopyIcon';
import DeleteIcon from '../Icons/DeleteIcon';
import StyledTooltip from '../Tooltip';
import CopyMoveIcon from '../Icons/CopyMoveIcon';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@emotion/react';
import { formatDistanceToNow } from 'date-fns';
import EditIcon from '../Icons/EditIcon';
import { ChatInputContainer, StyledTextField } from './StyledComponents';
import { SaveButton } from '@/pages/Prompts/Components/Common';
import NormalRoundButton from '../NormalRoundButton';

const UserMessageContainer = styled(ListItem)(() => `
  flex: 1 0 0
  display: flex;
  padding: 0.75rem;
  align-items: flex-start;
  gap: 1rem;
  align-self: stretch;
  border-radius: 0.25rem;
  margin-bottom: 8px;
`);

const Message = styled(Box)(({ theme }) => `
  flex: 1 0 0;
  color: ${theme.palette.text.secondary};
`);

const ButtonsContainer = styled(Box)(({ theme }) => `
position: absolute;
top: 6px;
right: 6px;
display: flex;
justify-content: flex-end;
align-items: flex-start;
gap: 0.5rem;
padding-left: 32px;
padding-bottom: 2px;
background: ${theme.palette.background.userMessageActions};
`);

const UserMessage = React.forwardRef((props, ref) => {
  const theme = useTheme()
  const { content, created_at, onCopy, onCopyToMessages, onDelete, verticalMode, onSubmit, shouldDisableEdit, messageId, participant } = props;
  const [value, setValue] = useState(content);
  const [isEditing, setIsEditing] = useState(false)
  const avatar = useSelector((state) => state.user?.avatar);
  const userName = useSelector((state) => state.user?.name);
  const [showActions, setShowActions] = useState(false);
  const onMouseEnter = useCallback(
    () => {
      setShowActions(true);
    },
    [],
  )
  const onMouseLeave = useCallback(
    () => {
      setShowActions(false);
    },
    [],
  )
  const onEdit = useCallback(
    () => {
      setIsEditing(true);
    },
    [],
  )

  const onCancel = useCallback(() => {
    setIsEditing(false);
    setValue(content);
  }, [content])

  const onChange = useCallback(
    (event) => {
      setValue(event.target.value)
    },
    [],
  )

  const onClickSubmit = useCallback(
    () => {
      onSubmit(messageId, participant, value);
      setIsEditing(false);
    },
    [messageId, onSubmit, participant, value],
  )

  return (
    <UserMessageContainer sx={verticalMode ? { flexDirection: 'column', gap: '8px', padding: '12px 0px 12px 0px ' } : undefined} ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {verticalMode ?
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0px 4px 0px 4px' }}>
          <ListItemAvatar sx={{ minWidth: '24px' }}>
            <UserAvatar name={userName} avatar={avatar} size={24} />
          </ListItemAvatar>
          <Typography variant='bodySmall'>
            {formatDistanceToNow(new Date(created_at)) + ' ago'}
          </Typography>
        </Box>
        :
        <ListItemAvatar sx={{ minWidth: '24px' }}>
          <UserAvatar name={userName} avatar={avatar} size={24} />
        </ListItemAvatar>
      }
      {!isEditing ? <Message sx={verticalMode ? {
        background: theme.palette.background.aiAnswerBkg,
        width: '100%',
        borderRadius: '8px',
        padding: '12px 16px 12px 16px',
        position: 'relative'
      } : undefined}>
        {
          content.split('\n').map((string, index) =>
          (<Box key={index}>
            <Typography sx={{
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
              wordBreak: 'break-word'
            }} variant='bodyMedium'>
              {string}
            </Typography>
          </Box>))
        }
        {showActions && <ButtonsContainer sx={verticalMode ? { top: '4px', background: theme.palette.background.aiAnswerActions } : undefined}>
          {
            onCopy &&
            <StyledTooltip title={'Copy to clipboard'} placement="top">
              <IconButton onClick={onCopy}>
                <CopyIcon sx={{ fontSize: '1.13rem' }} />
              </IconButton>
            </StyledTooltip>
          }
          {
            onCopyToMessages &&
            <StyledTooltip title={'Copy to Messages'} placement="top">
              <IconButton onClick={onCopyToMessages}>
                <CopyMoveIcon sx={{ fontSize: '1.13rem' }} />
              </IconButton>
            </StyledTooltip>
          }
          {
            verticalMode && onSubmit &&
            <StyledTooltip title={'Edit the message and regenerate answer'} placement="top">
              <IconButton disabled={shouldDisableEdit} onClick={onEdit}>
                <EditIcon sx={{ fontSize: '1.13rem' }} />
              </IconButton>
            </StyledTooltip>
          }
          {
            onDelete &&
            <StyledTooltip title={'Delete'} placement="top">
              <IconButton onClick={onDelete}>
                <DeleteIcon sx={{ fontSize: '1.13rem' }} />
              </IconButton>
            </StyledTooltip>
          }
        </ButtonsContainer>}
      </Message> :
        <Box sx={{ width: '100%' }}>
          <ChatInputContainer
            sx={{
              borderRadius: '8px',
              border: `1px solid ${theme.palette.border.userMessageEditor}`,
              background: theme.palette.background.userInputBackground,
            }}>
            <StyledTextField
              value={value}
              fullWidth
              id="standard-multiline-static"
              label=""
              multiline
              maxRows={15}
              variant="standard"
              onChange={onChange}
              placeholder=''
              InputProps={{
                style: { color: theme.palette.text.secondary },
                disableUnderline: true,
                endAdornment: null
              }}
            />
          </ChatInputContainer>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            <SaveButton sx={{ marginRight: '0px' }} disabled={value === content} onClick={onClickSubmit} >
              Submit
            </SaveButton>
            <NormalRoundButton variant='contained' color='secondary' onClick={onCancel}>
              Cancel
            </NormalRoundButton>
          </Box>
        </Box>
      }
    </UserMessageContainer>
  )
})

UserMessage.displayName = 'UserMessage';


export default UserMessage;