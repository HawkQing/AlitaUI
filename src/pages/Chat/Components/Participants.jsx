import { Box, Typography } from '@mui/material';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import ParticipantItem from './ParticipantItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import { useIsSmallWindow } from '@/pages/hooks';

const Participants = ({ participants, onShowSettings, collapsed, onCollapsed }) => {
  const { isSmallWindow } = useIsSmallWindow();
  return (
    <Box >
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: (collapsed && !isSmallWindow) ? 'center' : 'space-between' }}>
        {
          (!collapsed || isSmallWindow) &&
          <Typography variant='subtitle'>
            Participants
          </Typography>
        }
        {
          !isSmallWindow &&
          <Box sx={{ cursor: 'pointer' }} onClick={onCollapsed}>
            {collapsed ? <DoubleLeftIcon width={'16px'} /> : <DoubleRightIcon width={'16px'} />}
          </Box>
        }
      </Box>
      <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }} >
        {
          participants.map((participant) => (
            <ParticipantItem
              key={participant.id}
              collapsed={collapsed && !isSmallWindow}
              participant={participant}
              onShowSettings={onShowSettings}
            />
          ))
        }
      </Box>
    </Box>

  )
}

export default Participants