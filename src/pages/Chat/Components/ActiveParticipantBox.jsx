import { Box, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';
import { getIcon } from './ParticipantItem';
import CloseIcon from '@/components/Icons/CloseIcon.jsx';
import InfoIcon from '@/components/Icons/InfoIcon';

const ActiveParticipantBox = ({ activeParticipant, onClearActiveParticipant }) => {
  const theme = useTheme();
  return (
    <Box sx={{
      width: '100%',
      borderTop: `1px solid ${theme.palette.border.lines}`,
      padding: '8px 16px 8px 16px',
      gap: '12px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
        <Box sx={{ width: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {
            activeParticipant ? getIcon(activeParticipant.type, false, theme) : <InfoIcon />
          }
        </Box>
        <Typography variant='bodyMedium' color='secondary'>
          {activeParticipant ? (activeParticipant.name || activeParticipant.model_name) : 'No active participant. Let’s choose one to start conversation!'}
        </Typography>

      </Box>
      {activeParticipant && <Box style={{ cursor: 'pointer', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        onClick={onClearActiveParticipant}>
        <CloseIcon fontSize='16px' />
      </Box>}
    </Box>
  )
};


export default ActiveParticipantBox;