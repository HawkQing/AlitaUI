import { Box, Typography } from '@mui/material';
import ArrowLeftIcon from '@/components/Icons/ArrowLeftIcon';
import { useCallback, useState } from 'react';
import LLMSettings from './LLMSettings';
import { useTheme } from '@emotion/react';
import { getIcon } from '@/pages/Chat/Components/ParticipantItem';
import RestoreIcon from '@/components/Icons/RestoreIcon';
import VariableList from '@/pages/Prompts/Components/Form/VariableList';
import { ChatParticipantType } from '@/common/constants';
import DeleteParticipantButton from './DeleteParticipantButton';

const ParticipantSettings = ({ onBackAndSave, participant, isActive, onDelete }) => {
  const theme = useTheme()
  const [forceRenderCounter, setForceRenderCounter] = useState(0)
  const [editedParticipant, setEditedParticipant] = useState({ ...participant })

  const onClickBack = useCallback(() => {
    onBackAndSave(editedParticipant)
  }, [editedParticipant, onBackAndSave])

  const onChangeLLMSettings = useCallback(
    (field) => (value) => {
      setEditedParticipant(prev => ({
        ...prev,
        [field]: value
      }))
    },
    [],
  )

  const onChangePromptLLMSettings = useCallback(
    (field) => (value) => {
      setEditedParticipant(prev => ({
        ...prev,
        version_details: {
          ...prev.version_details,
          model_settings: {
            ...prev.version_details.model_settings,
            [field]: value
          }
        }
      }))
    },
    [],
  )

  const onChangeVariable = useCallback(
    (label, newValue) => {
      setEditedParticipant(prev => ({
        ...prev,
        version_details: {
          ...prev.version_details,
          variables: prev.variables.map((v) => v.name === label ? ({ name: label, value: newValue }) : v)
        }
      }))
    },
    [],
  )

  const onRestore = useCallback(
    () => {
      setEditedParticipant({ ...participant });
      setForceRenderCounter(prev => prev + 1)
    },
    [participant],
  )

  return (
    <Box >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          onClick={onClickBack}
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', gap: '4px' }}
        >
          <ArrowLeftIcon />
          <Typography variant='subtitle'>
            Settings
          </Typography>
        </Box>
        <Box sx={{ cursor: 'pointer' }} onClick={onRestore}>
          <RestoreIcon />
        </Box>
      </Box>
      <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }} >
        <Box
          sx={{
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            gap: '12px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '40px',
            boxSizing: 'border-box',
            background: isActive ? theme.palette.split.pressed : theme.palette.background.secondary,
            border: isActive ? `1px solid ${theme.palette.split.hover}` : undefined,
            '&:hover #DeleteButton': {
              visibility: 'visible',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}>
            {
              getIcon(participant.type, isActive, theme)
            }
            <Typography variant='bodyMedium' color='text.secondary'>
              {
                participant.name || participant.model_name || 'Participant Name'
              }
            </Typography>
          </Box>
          <DeleteParticipantButton participant={participant} onDelete={onDelete} />
        </Box>
        {
          participant.type === ChatParticipantType.Models &&
          <LLMSettings llmSettings={editedParticipant} onChangeLLMSettings={onChangeLLMSettings} />
        }
        {
          participant.type === ChatParticipantType.Prompts &&
          <LLMSettings llmSettings={editedParticipant.version_details.model_settings} onChangeLLMSettings={onChangePromptLLMSettings} />
        }
        {
          participant.type === ChatParticipantType.Applications && !!editedParticipant?.version_details.variables.length &&
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
            <Typography sx={{ marginLeft: '12px' }} variant='bodySmall' >
              Application variables
            </Typography>
            <VariableList
              key={forceRenderCounter}
              variables={editedParticipant?.version_details.variables}
              onChangeVariable={onChangeVariable}
              showexpandicon='true'
              multiline
              collapseContent
            />
          </Box>

        }
      </Box>
    </Box>

  )
}

export default ParticipantSettings