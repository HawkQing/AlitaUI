import { Box, Typography } from '@mui/material';
import DoubleRightIcon from '@/components/Icons/DoubleRightIcon';
import ParticipantItem from './ParticipantItem';
import DoubleLeftIcon from '@/components/Icons/DoubleLeftIcon';
import { useIsSmallWindow } from '@/pages/hooks';
import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import ParticipantsDropdown from './ParticipantsDropdown';

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
  const theme = useTheme()
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
          <Box sx={{
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': {
              background: theme.palette.background.button.secondary.hover,
            }
          }}
            onClick={onCollapsed}>
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
      <Box
        sx={{
          marginTop: '8px',
          gap: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: (!collapsed || isSmallWindow) ? 'flex-start' : 'center'
        }} >
        {
          types.map((type) => {
            const participantsOfTheType = participants.filter(participant => participant.type === type)
            return (!collapsed || isSmallWindow) ?
              <Box
                key={type}
                sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <Typography sx={{ textTransform: 'capitalize' }} variant='bodySmall' color='text.default'>
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
              :
              <ParticipantsDropdown
                key={type}
                activeParticipantId={activeParticipantId}
                type={type}
                participants={participantsOfTheType}
                onSelectParticipant={onSelectParticipant}
              />
          })
        }

      </Box>
    </Box>

  )
}

export default Participants