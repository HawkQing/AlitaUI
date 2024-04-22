import ApplicationsIcon from '@/components/Icons/ApplicationsIcon';
import ConsoleIcon from '@/components/Icons/ConsoleIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import EmojiIcon from '@/components/Icons/EmojiIcon';
import ModelIcon from '@/components/Icons/ModelIcon';
import SettingIcon from '@/components/Icons/SettingIcon';
import { Box, Typography, useTheme } from '@mui/material';
import { useCallback, useMemo } from 'react';

export const getIcon = (type, isActive, theme, showBigIcon = false) => {
  switch (type) {
    case 'prompts':
      return <ConsoleIcon fontSize={showBigIcon ? '24px' : '16px'} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    case 'datasources':
      return <DatabaseIcon fontSize={showBigIcon ? '24px' : '16px'} sx={{ color: isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default }} />
    case 'applications':
      return <ApplicationsIcon sx={{ color: isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default, fontSize: showBigIcon ? 24 : 16 }} />
    case 'models':
      return <ModelIcon width={showBigIcon ? 24 : 16} height={showBigIcon ? 24 : 16} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    default:
      return <EmojiIcon width={showBigIcon ? 24 : 16} height={showBigIcon ? 24 : 16} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} fontSize={showBigIcon ? '24px' : '16px'} />
  }
}

const ParticipantItem = ({ participant = {}, collapsed, isActive, onClickItem, onShowSettings }) => {
  const { type, name, model_name } = participant
  const hasSettings = useMemo(() => {
    switch (participant.type) {
      case 'models':
        return true;
      case 'prompts':
      case 'applications':
        return !!participant.variables?.length;
      default:
        return false;
    }
  }, [participant.type, participant.variables])
  const theme = useTheme();
  const onClickSettings = useCallback(
    (event) => {
      event.stopPropagation();
      onShowSettings(participant);
    },
    [onShowSettings, participant],
  )
  const onClickHandler = useCallback(
    () => {
      onClickItem(participant);
    },
    [onClickItem, participant],
  )

  return (
    <Box
      onClick={onClickHandler}
      sx={{
        cursor: 'pointer',
        padding: collapsed ? '0 0' : '8px 16px',
        borderRadius: '8px',
        gap: '12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
        height: '40px',
        boxSizing: 'border-box',
        background: theme.palette.background.secondary,
        ':hover': {
          background: theme.palette.border.table,
        },
        '&:hover #SettingButton': {
          visibility: 'visible',
        },
      }}
    >
      <Box sx={{ width: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {
          getIcon(type, isActive, theme)
        }
      </Box>
      {!collapsed && <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
        <Typography variant='bodyMedium' color='text.secondary'>
          {
            name || model_name || 'Participant Name'
          }
        </Typography>
      </Box>}
      {!collapsed && hasSettings && <Box
        id='SettingButton'
        sx={{
          width: '24px',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          visibility: 'hidden',
        }}
        onClick={onClickSettings}
      >
        <SettingIcon fill={theme.palette.icon.fill.default} fontSize={'16pz'} />
      </Box>}
    </Box>
  )
}

export default ParticipantItem