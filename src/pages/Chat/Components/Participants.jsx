import { Box, Typography } from '@mui/material';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import ParticipantItem from './ParticipantItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import { useIsSmallWindow } from '@/pages/hooks';
import { useMemo } from 'react';

const Participants = ({ participants, onShowSettings, collapsed, onCollapsed, activeParticipantId, onSelectParticipant }) => {
  const { isSmallWindow } = useIsSmallWindow();
  const types = Object.keys(participants);
  const noParticipant = useMemo(() => {
    return types.reduce((sum, type) => sum && !participants[type].length, true)
  }, [participants, types])
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
      {
        noParticipant &&
        <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }} >
          <Typography variant='bodyMedium' color='text.button.disabled'>
            Still no participants added
          </Typography>
        </Box>
      }
      <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }} >
        {
          types.map((type) => {
            return participants[type].length ? (
              <Box key={type} sx={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <Typography sx={{textTransform: 'capitalize'}} variant='bodySmall' color='text.default'>
                  {type}
                </Typography>
                {
                  participants[type].map((participant, index) => (
                    <ParticipantItem
                      onClickItem={onSelectParticipant}
                      key={type + index}
                      collapsed={collapsed && !isSmallWindow}
                      participant={participant}
                      onShowSettings={onShowSettings}
                      isActive={activeParticipantId === participant.id}
                    />
                  ))
                }
              </Box>
            ) : null
          })
        }

      </Box>
    </Box>

  )
}

export default Participants