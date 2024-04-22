import { Box, Typography } from '@mui/material';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import ParticipantItem from './ParticipantItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import { useIsSmallWindow } from '@/pages/hooks';
import { useMemo } from 'react';

const getTypes = (participants) => {
  const types = []
  participants.forEach(participant => {
    if (!types.includes(participant.type)) {
      types.push(participant.type)
    }
  })
  return types.sort();
}

const Participants = ({ participants, onShowSettings, collapsed, onCollapsed, activeParticipantId, onSelectParticipant }) => {
  const { isSmallWindow } = useIsSmallWindow();
  const types = useMemo(() => getTypes(participants), [participants]);

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
            {collapsed ? <DoubleLeftIcon width={16} /> : <DoubleRightIcon width={16} />}
          </Box>
        }
      </Box>
      {
        !participants.length && (!collapsed || isSmallWindow) &&
        <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }} >
          <Typography variant='bodyMedium' color='text.button.disabled'>
            Still no participants added
          </Typography>
        </Box>
      }
      <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }} >
        {
          types.map((type) => {
            const participantsOfTheType = participants.filter(participant => participant.type === type)
            return  <Box key={type} sx={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <Typography sx={{textTransform: 'capitalize'}} variant='bodySmall' color='text.default'>
                  {type}
                </Typography>
                {
                  participantsOfTheType.map((participant, index) => (
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
          })
        }

      </Box>
    </Box>

  )
}

export default Participants