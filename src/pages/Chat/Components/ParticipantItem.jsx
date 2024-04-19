import ApplicationsIcon from '@/components/Icons/ApplicationsIcon';
import CancelIcon from '@/components/Icons/CancelIcon';
import ConsoleIcon from '@/components/Icons/ConsoleIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import EmojiIcon from '@/components/Icons/EmojiIcon';
import ModelIcon from '@/components/Icons/ModelIcon';
import SettingIcon from '@/components/Icons/SettingIcon';
import { Box, Typography, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

export const getIcon = (type, isActive, theme, showBigIcon = false) => {
  switch (type) {
    case 'prompts':
      return <ConsoleIcon fontSize={showBigIcon ? '24px' : '16px'} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    case 'datasources':
      return <DatabaseIcon fontSize={showBigIcon ? '24px' : '16px'} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    case 'applications':
      return <ApplicationsIcon width={showBigIcon ? '24px' : '16px'} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    case 'models':
      return <ModelIcon width={showBigIcon ? 24 : 16} height={showBigIcon ? 24 : 16} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    default:
      return <EmojiIcon width={showBigIcon ? 24 : 16} height={showBigIcon ? 24 : 16} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} fontSize={showBigIcon ? '24px' : '16px'} />
  }
}

const ParticipantItem = ({ participant = {}, collapsed, isActive, onClickItem }) => {
  const { type, name, model_name } = participant
  const [showSettings, setShowSettings] = useState(false)
  const theme = useTheme();
  const onShowSettings = useCallback(
    () => {
      setShowSettings(prev => !prev);
    },
    [],
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
      {!collapsed && <Box
        sx={{
          width: '24px',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={onShowSettings}
      >
        {showSettings ? <CancelIcon /> : <SettingIcon fill={theme.palette.icon.fill.default} fontSize={'16pz'} />}
      </Box>}
    </Box>
  )
}

export default ParticipantItem