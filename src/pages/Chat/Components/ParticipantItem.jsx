import ApplicationsIcon from '@/components/Icons/ApplicationsIcon';
import CancelIcon from '@/components/Icons/CancelIcon';
import ConsoleIcon from '@/components/Icons/ConsoleIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import EmojiIcon from '@/components/Icons/EmojiIcon';
import SettingIcon from '@/components/Icons/SettingIcon';
import { Box, Typography, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

const getIcon = (type) => {
  switch (type) {
    case 'Prompts':
      return <ConsoleIcon />
    case 'Datasource':
      return <DatabaseIcon />
    case 'Application':
      return <ApplicationsIcon />
    case 'Model':
      return <EmojiIcon />
    default:
      return <EmojiIcon fontSize={'16px'} />
  }
}

const ParticipantItem = ({ participant = {}, collapsed }) => {
  const { type, name } = participant
  const [showSettings, setShowSettings] = useState(false)
  const theme = useTheme();
  const onShowSettings = useCallback(
    () => {
      setShowSettings(prev => !prev);
    },
    [],
  )

  return (
    <Box
      sx={{
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
      <Box sx={{ width: '16px', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {
          getIcon(type)
        }
      </Box>
      {!collapsed && <Box sx={{ flex: 1 }}>
        <Typography variant='bodyMedium' color='text.secondary'>
          {
            name || 'Participant Name'
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