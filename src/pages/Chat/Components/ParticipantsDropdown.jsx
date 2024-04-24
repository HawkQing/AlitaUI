import { Box, MenuItem, Typography } from '@mui/material';
import { getIcon } from './ParticipantItem';
import { useCallback, useRef, useState, useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { CommonMenu } from '@/pages/Settings/components/CommonMenu';
import { StyledMenuItemIcon } from '@/components/SingleSelect';
import CheckedIcon from '@/components/Icons/CheckedIcon';


const ParticipantsDropdown = ({ type, participants, onSelectParticipant, activeParticipantId }) => {
  const theme = useTheme()
  const anchorRef = useRef(null);
  const isActive = useMemo(() => participants.find(participant => activeParticipantId === participant.id), [activeParticipantId, participants])
  const [showParticipants, setShowParticipants] = useState(false)
  const onClick = useCallback(
    () => {
      setShowParticipants(true);
    },
    [],
  )
  const onCloseMenu = useCallback(
    () => {
      setShowParticipants(false);
    },
    [],
  )

  const onClickParticipant = useCallback(
    (participant) => () => {
      onSelectParticipant(participant);
    },
    [onSelectParticipant],
  )

  return participants.length > 1 ? (
    <>
      <Box
        ref={anchorRef}
        onClick={onClick}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          boxSizing: 'border-box',
          padding: '12px',
          borderRadius: '8px',
          background: isActive ? theme.palette.split.pressed : theme.palette.background.secondary,
          border: isActive ? `1px solid ${theme.palette.split.hover}` : undefined,
        }}>
        {
          getIcon(type, isActive, theme)
        }
      </Box>
      <CommonMenu
        id="create-integration-menu-list"
        aria-labelledby="create-integration-menu-button"
        anchorEl={anchorRef.current}
        open={showParticipants}
        onClose={onCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            marginTop: '0px',
          },
        }}
      >
        {
          participants.map((participant) => (
            <MenuItem
              key={participant.id}
              onClick={onClickParticipant(participant)}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: '8px 20px',
                gap: '12px'
              }}
            >
              <Typography variant='labelMedium'>{participant.name || participant.model_name}</Typography>
              {participant.id === activeParticipantId &&
                <StyledMenuItemIcon>
                  <CheckedIcon />
                </StyledMenuItemIcon>
              }
            </MenuItem>
          ))
        }
      </CommonMenu>
    </>)
    :
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        height: '40px',
        boxSizing: 'border-box',
        padding: '12px',
        borderRadius: '8px',
        background: isActive ? theme.palette.split.pressed : theme.palette.background.secondary,
        border: isActive ? `1px solid ${theme.palette.split.hover}` : undefined,
      }}>
      {
        getIcon(type, isActive, theme)
      }
    </Box>
}

export default ParticipantsDropdown