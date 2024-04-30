import { Box, Typography } from '@mui/material';
import ArrowLeftIcon from '@/components/Icons/ArrowLeftIcon';
import { useCallback, useMemo, useState } from 'react';
import LLMSettings from './LLMSettings';
import { useTheme } from '@emotion/react';
import { getIcon } from '@/pages/Chat/Components/ParticipantItem';
import RestoreIcon from '@/components/Icons/RestoreIcon';
import VariableList from '@/pages/Prompts/Components/Form/VariableList';
import { ChatParticipantType } from '@/common/constants';
import DeleteParticipantButton from './DeleteParticipantButton';
import DatasourceSettings from './DatasourceSettings';
import { updateObjectByPath } from '@/common/utils';
import SingleSelect from '@/components/SingleSelect';
import { useLazyGetVersionDetailQuery } from '@/api/prompts';
import { useSelectedProjectId } from '@/pages/hooks';
import { useLazyGetApplicationVersionDetailQuery } from '@/api/applications';

const prefixPath = 'version_details.datasource_settings.chat.'

const ParticipantSettings = ({ onBackAndSave, participant, isActive, onDelete }) => {
  const theme = useTheme()
  const projectId = useSelectedProjectId();
  const [getPromptVersionDetail] = useLazyGetVersionDetailQuery();
  const [getApplicationVersionDetail] = useLazyGetApplicationVersionDetailQuery();

  const [forceRenderCounter, setForceRenderCounter] = useState(0)
  const [editedParticipant, setEditedParticipant] = useState({ ...participant })
  const { versions, version_details } = editedParticipant;
  const versionOptions = useMemo(() => versions ? versions.map(version => ({ value: version.id, label: version.name })) : [], [versions])

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
          variables: prev.version_details.variables.map((v) => v.name === label ? ({ name: label, value: newValue }) : v)
        }
      }))
    },
    [],
  )

  const onDatasourceSettings = useCallback(
    (field) => (value) => {
      const newParticipant = updateObjectByPath(editedParticipant, prefixPath + field, value)
      setEditedParticipant(newParticipant)
    },
    [editedParticipant],
  )

  const onRestore = useCallback(
    () => {
      setEditedParticipant({ ...participant });
      setForceRenderCounter(prev => prev + 1)
    },
    [participant],
  )

  const onChangeVersion = useCallback(async (id) => {
    switch (editedParticipant.type) {
      case ChatParticipantType.Prompts:
        {
          const result = await getPromptVersionDetail({ projectId, promptId: editedParticipant.id, version: id });
          setEditedParticipant({ 
            ...editedParticipant,
            version_details: result.data
           });
        }
        break;
      case ChatParticipantType.Applications:
        {
          const result = await getApplicationVersionDetail({ projectId, applicationId: editedParticipant.id, versionId: id });
          setEditedParticipant({ 
            ...editedParticipant,
            version_details: result.data
           });
        }
        break;
      default:
        break;
    }
  }, [editedParticipant, getApplicationVersionDetail, getPromptVersionDetail, projectId]);

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '32px' }}>
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
      <Box sx={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)' }} >
        <Box
          sx={{
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
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', width: 'calc(100% - 24px)' }}>
            {
              getIcon(participant.type, isActive, theme)
            }
            <Typography variant='bodyMedium' color='text.secondary' sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {
                participant.name || participant.model_name || 'Participant Name'
              }
            </Typography>
          </Box>
          <DeleteParticipantButton sx={{width: '24px'}} participant={participant} onDelete={onDelete} />
        </Box>
        <Box sx={{
          maxHeight: 'calc(100% - 50px)',
          overflowY: 'scroll',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}>
          {
            versions?.length > 1 &&
            <SingleSelect
              showBorder
              label={'Version'}
              onValueChange={onChangeVersion}
              value={version_details?.id}
              options={versionOptions}
              customSelectedFontSize={'0.875rem'}
              sx={{ marginTop: '10px', marginBottom: '10px' }}
            />
          }
          {
            participant.type === ChatParticipantType.Models &&
            <LLMSettings llmSettings={editedParticipant} onChangeLLMSettings={onChangeLLMSettings} />
          }
          {
            participant.type === ChatParticipantType.Prompts &&
            <LLMSettings llmSettings={editedParticipant.version_details.model_settings} onChangeLLMSettings={onChangePromptLLMSettings} />
          }
          {
            participant.type === ChatParticipantType.Applications &&
            <>
              <LLMSettings llmSettings={editedParticipant.version_details.llm_settings} onChangeLLMSettings={onChangePromptLLMSettings} />
              {!!editedParticipant?.version_details.variables.length &&
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '24px' }}>
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
            </>
          }
          {
            participant.type === ChatParticipantType.Datasources &&
            <DatasourceSettings
              chat_settings_ai={editedParticipant?.version_details?.datasource_settings?.chat?.chat_settings_ai}
              chat_settings_embedding={editedParticipant?.version_details?.datasource_settings?.chat?.chat_settings_embedding}
              onDatasourceSettings={onDatasourceSettings}
              verticalMode
            />
          }
        </Box>
      </Box>
    </Box>

  )
}

export default ParticipantSettings