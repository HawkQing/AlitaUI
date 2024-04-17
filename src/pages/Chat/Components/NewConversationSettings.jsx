import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StatusDot } from '@/components/StatusDot';
import {
  PromptStatus,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P
} from '@/common/constants';
import GroupedButton from '@/components/GroupedButton';
import useModelOptions from '@/pages/DataSources/Components/Datasources/useModelOptions';
import SingleGroupSelect from '@/components/SingleGroupSelect';
import { genModelSelectValue, getIntegrationNameByUid } from '@/common/promptApiUtils';
import DatasourceSelect from '@/pages/Applications/Components/Tools/DatasourceSelect';
import ApplicationSelect from './ApplicationSelect';
import { useTheme } from '@emotion/react';
import StyledInputEnhancer from '@/components/StyledInputEnhancer';
import LLMSettings from './LLMSettings';

const DialogTitleDiv = styled('div')(() => ({
  width: '100%',
}));

const buttonItems = [{
  label: 'Model',
  value: 'model',
}, {
  label: 'Datasource',
  value: 'datasource',
}, {
  label: 'Application',
  value: 'application',
}]

const NewConversationSettings = ({
  conversation,
  onChangeConversation,
}) => {
  const theme = useTheme();
  const { modelOptions } = useModelOptions();
  const [currentSettingType, setCurrentSettingType] = useState('model')

  useEffect(() => {
    setCurrentSettingType(conversation.participant_type);
  }, [conversation.participant_type])

  const selectedChatModel = useMemo(() => conversation.participant || {}, [conversation.participant])
  const chatModelValue = useMemo(() =>
  (
    selectedChatModel.integration_uid &&
      selectedChatModel.model_name ?
      genModelSelectValue(selectedChatModel.integration_uid,
        selectedChatModel.model_name,
        getIntegrationNameByUid(selectedChatModel.integration_uid, modelOptions))
      : ''),
    [modelOptions, selectedChatModel.integration_uid, selectedChatModel.model_name]);

  const onSelectType = useCallback((event) => {
    onChangeConversation({
      ...conversation,
      is_public: event.target.value
    })
  }, [conversation, onChangeConversation]);

  const onSelectParticipantType = useCallback(
    (e) => {
      const newType = e?.target?.value;
      if (newType !== conversation.participant_type) {
        onChangeConversation({
          ...conversation,
          participant_type: newType,
          participant: {}
        })
      }
    },
    [conversation, onChangeConversation],
  );

  const onChangeName = useCallback((event) => {
    onChangeConversation({
      ...conversation,
      name: event.target.value,
    })
  }, [conversation, onChangeConversation]);

  const onChangeChatModel = useCallback((integrationUid, modelName) => {
    onChangeConversation({
      ...conversation,
      participant: {
        ...conversation.participant,
        integration_uid: integrationUid,
        model_name: modelName,
        max_tokens: DEFAULT_MAX_TOKENS,
        top_p: DEFAULT_TOP_P,
        top_k: DEFAULT_TOP_K,
        temperature: DEFAULT_TEMPERATURE,
      },
    })
  }, [conversation, onChangeConversation])

  const onChangeLLMSettings = useCallback(
    (field) => (value) => {
      onChangeConversation({
        ...conversation,
        participant: {
          ...conversation.participant,
          [field]: value
        },
      })
    },
    [conversation, onChangeConversation],
  )

  const onChangeChatDatasource = useCallback((datasource) => {
    onChangeConversation({
      ...conversation,
      participant: {
        name: datasource.label,
        id: datasource.value,
        description: datasource.description,
      },
    })
  }, [conversation, onChangeConversation]);

  const onChangeChatApplication = useCallback((application) => {
    onChangeConversation({
      ...conversation,
      participant: {
        name: application.label,
        id: application.value,
        description: application.description,
      },
    })
  }, [conversation, onChangeConversation]);

  return (
    <Box sx={{
      width: '100%',
      flexGrow: 1,
      height: 'calc(100vh - 200px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Box sx={{
        display: 'flex',
        width: '80%',
        maxWidth: '600px',
        flexDirection: 'column',
        padding: '24px 40px 24px 40px',
        gap: '16px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.border.table}`,
        background: theme.palette.background.userInputBackground
      }}>
        <DialogTitleDiv>
          <StyledInputEnhancer
            value={conversation.name}
            autoComplete="off"
            variant='standard'
            onChange={onChangeName}
          />
        </DialogTitleDiv>
        <Box >
          <RadioGroup
            row
            aria-labelledby="private-public-radio-buttons-group-label"
            name="private-public-radio-buttons-group"
            sx={{ gap: '24px' }}
            value={conversation.is_public}
            onChange={onSelectType}
          >
            <FormControlLabel
              value={false}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <StatusDot size='10px' status={PromptStatus.Draft} />
                  <Typography variant='bodyMedium'>
                    Private
                  </Typography>
                </Box>
              } />
            <FormControlLabel
              value={true}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <StatusDot size='10px' status={PromptStatus.Published} />
                  <Typography variant='bodyMedium'>
                    Public
                  </Typography>
                </Box>
              } />
          </RadioGroup>
        </Box>
        <Box >
          <GroupedButton
            value={currentSettingType}
            onChange={onSelectParticipantType}
            buttonItems={buttonItems}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          {
            currentSettingType === 'model' &&
            <SingleGroupSelect
              label={'Model'}
              value={chatModelValue}
              onValueChange={onChangeChatModel}
              options={modelOptions}
            />
          }
          {
            currentSettingType === 'datasource' &&
            <DatasourceSelect
              required
              onValueChange={onChangeChatDatasource}
              value={conversation.participant.id}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
          {
            currentSettingType === 'application' &&
            <ApplicationSelect
              required
              onValueChange={onChangeChatApplication}
              value={conversation.participant.id}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
        </Box>
        {
          currentSettingType === 'model' && selectedChatModel.model_name &&
          <LLMSettings llmSettings={selectedChatModel} onChangeLLMSettings={onChangeLLMSettings} />
        }
      </Box>
    </Box>
  );
};

export default NewConversationSettings;