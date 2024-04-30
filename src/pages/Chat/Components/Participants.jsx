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

const Participants = ({ participants, onShowSettings, collapsed, onCollapsed, activeParticipantId, onSelectParticipant, onDeleteParticipant, onUpdateParticipant }) => {
  const { isSmallWindow } = useIsSmallWindow();
  const theme = useTheme()
  const types = useMemo(() => getTypes(participants), [participants]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }} >
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: (collapsed && !isSmallWindow) ? 'center' : 'space-between', height: '32px', alignItems: 'center' }}>
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
          alignItems: (!collapsed || isSmallWindow) ? 'flex-start' : 'center',
          overflowY: 'scroll',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
          maxHeight: `calc(100% - 40px)`,
          paddingBottom: '32px'
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
                      onDelete={onDeleteParticipant}
                      onUpdateParticipant={onUpdateParticipant}
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
      <Box sx={{ width: '100%', height: '40px', position: 'absolute', bottom: '0px', left: '0px', background: theme.palette.background.conversationBottomCover }} />
    </Box>

  )
}

export default Participants