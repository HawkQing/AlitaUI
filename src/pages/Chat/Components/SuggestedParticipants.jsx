import { useLazyGetModelsQuery } from '@/api/integrations';
import { ChatParticipantType, ChatParticipantTypeLabel } from '@/common/constants';
import { useSelectedProjectId } from '@/pages/hooks';
import { useTheme } from '@emotion/react';
import { Box, Typography } from '@mui/material';
import { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const SuggestedParticipants = forwardRef(({ participants, participantType, onSelectParticipant }, controlRef) => {
  const theme = useTheme();
  const listRefs = useRef([]);
  const projectId = useSelectedProjectId()
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [getModels, { data: integrations }] = useLazyGetModelsQuery();
  const onKeyDown = useCallback((event) => {
    if (event.key === 'ArrowUp' && focusedIndex > 0) {
      setFocusedIndex(focusedIndex - 1);
      listRefs.current[focusedIndex - 1].focus();
    } else if (event.key === 'ArrowDown' && focusedIndex < participants.length - 1) {
      setFocusedIndex(focusedIndex + 1);
      listRefs.current[focusedIndex + 1].focus();
    }
  }, [focusedIndex, participants.length]);

  const onClickParticipant = useCallback(
    (participant) => () => {
      onSelectParticipant(participant)
    },
    [onSelectParticipant],
  )

  const selectFocusedParticipant = useCallback(
    () => {
      if (participants.length) {
        onSelectParticipant(participants[focusedIndex])
      }
    },
    [focusedIndex, onSelectParticipant, participants],
  )

  useImperativeHandle(controlRef, () => ({
    selectParticipant: selectFocusedParticipant,
  }));

  useEffect(() => {
    if (participantType === ChatParticipantType.Models) {
      getModels(projectId);
    }
  }, [getModels, participantType, projectId])

  return (
    <Box sx={{ width: '100%', paddingLeft: '8px', paddingRight: '8px' }}>
      <Box sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        background: theme.palette.background.secondary,
        marginBottom: '12px'
      }}>
        <Box
          sx={{
            padding: '8px 16px 8px 16px',
            borderBottom: `2px solid ${theme.palette.text.button.primary}`
          }}
        >
          <Typography variant='bodyMedium' color='text.default'>
            {`${ChatParticipantTypeLabel[participantType]} suggestions`}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            overflowY: 'scroll',
            maxHeight: '400px',
          }}>
          {
            participants.map((participant, index) => (
              <Box
                // eslint-disable-next-line react/jsx-no-bind
                ref={(ref) => (listRefs.current[index] = ref)}
                onClick={onClickParticipant(participant)}
                tabIndex={0}
                onKeyDown={onKeyDown}
                key={participant.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px 8px 16px',
                  width: '100%',
                  wordWrap: 'break-word',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: focusedIndex === index ? theme.palette.background.button.default : undefined,
                  '&:focus': {
                    outline: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                <Typography variant='bodyMedium' color='text.secondary'>
                  {
                    participant.name || participant.model_name
                  }
                </Typography>
                {
                  participantType === ChatParticipantType.Models &&
                  <Typography variant='bodySmall' color='text.default'>
                    {
                      participant.integration_name || integrations?.find(integration => integration.uid === participant.integration_uid)?.config?.name
                    }
                  </Typography>
                }
              </Box>
            ))
          }
          {
            !participants.length && <Box
              sx={{
                padding: '8px 16px 8px 16px',
                width: '100%',
                wordWrap: 'break-word',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography variant='bodyMedium' color='text.secondary'>
                No matching items found
              </Typography>
            </Box>
          }
        </Box>
      </Box>
    </Box>
  )
})

SuggestedParticipants.displayName = 'ChatBox'

export default SuggestedParticipants