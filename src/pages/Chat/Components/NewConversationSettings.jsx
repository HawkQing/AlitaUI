import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { StatusDot } from '@/components/StatusDot';
import {
  PromptStatus,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  PUBLIC_PROJECT_ID
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
import styled from '@emotion/styled';
import VariableList from '@/pages/Prompts/Components/Form/VariableList';
import useQueryApplicationDetail from './useQueryApplicationDetail';
import useQueryDataSourceDetail from './useQueryDataSourceDetail';

const DialogTitleDiv = styled('div')(() => ({
  width: '100%',
}));

const StyledContainer = styled(Box)(() => (
  `
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  ::-webkit-scrollbar {
    width: 0 !important;
    height: 0;import VariableList from '../../Prompts/Components/Form/VariableList';

  }
  `
));

const buttonItems = [{
  label: 'Model',
  value: 'models',
}, {
  label: 'Datasource',
  value: 'datasources',
}, {
  label: 'Application',
  value: 'applications',
}]

const NewConversationSettings = ({
  conversation,
  onChangeConversation,
}) => {
  const theme = useTheme();
  const conversationRef = useRef(conversation);
  const { modelOptions } = useModelOptions({ usePublicProjectId: true });
  const [currentSettingType, setCurrentSettingType] = useState('models')

  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  useEffect(() => {
    setCurrentSettingType(conversation.participant.type);
  }, [conversation.participant.type])

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
  const { getApplicationDetail, applicationDetail } = useQueryApplicationDetail();
  const { getDatasourceDetail, datasourceDetail } = useQueryDataSourceDetail();
  const variables = useMemo(() => conversation?.participant?.variables || [], [conversation?.participant?.variables])

  useEffect(() => {
    if (applicationDetail?.version_details?.variables) {
      onChangeConversation({
        ...conversationRef.current,
        participant: {
          ...conversationRef.current.participant,
          variables: [...applicationDetail.version_details.variables],
          llm_settings: applicationDetail.version_details.llm_settings
        },
      })
    }
  }, [applicationDetail?.version_details?.llm_settings, applicationDetail?.version_details?.variables, onChangeConversation])

  useEffect(() => {
    if (datasourceDetail?.version_details) {
      onChangeConversation({
        ...conversationRef.current,
        participant: {
          ...conversationRef.current.participant,
          chatSettings: datasourceDetail?.version_details?.datasource_settings?.chat,
          versionId: datasourceDetail?.version_details?.id,
          context: datasourceDetail?.version_details?.context 
        },
      })
    }
  }, [
    datasourceDetail?.version_details,
    onChangeConversation
  ])


  const onSelectType = useCallback((event) => {
    onChangeConversation({
      ...conversation,
      is_public: event.target.value
    })
  }, [conversation, onChangeConversation]);

  const onSelectParticipantType = useCallback(
    (e) => {
      const newType = e?.target?.value;
      if (newType !== conversation.participant.type) {
        onChangeConversation({
          ...conversation,
          participant: {
            type: newType,
          }
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
        id: integrationUid + '_' + modelName,
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
        ...conversation.participant,
        name: datasource.label,
        id: datasource.value,
        description: datasource.description,
      },
    })
    getDatasourceDetail({ projectId: PUBLIC_PROJECT_ID, datasourceId: datasource.value })
  }, [conversation, getDatasourceDetail, onChangeConversation]);

  const onChangeChatApplication = useCallback((application) => {
    onChangeConversation({
      ...conversation,
      participant: {
        ...conversation.participant,
        name: application.label,
        id: application.value,
        description: application.description,
        variables: [],
      },
    })
    getApplicationDetail({ projectId: PUBLIC_PROJECT_ID, applicationId: application.value })
  }, [conversation, getApplicationDetail, onChangeConversation]);

  const onChangeVariable = useCallback((label, newValue) => {
    onChangeConversation({
      ...conversation,
      participant: {
        ...conversation.participant,
        variables: conversation.participant.variables.map((v) => v.name === label ? ({ name: label, value: newValue }) : v)
      },
    })
  }, [conversation, onChangeConversation]);

  return (
    <Box sx={{
      width: '100%',
      flexGrow: 1,
      height: 'calc(100vh - 160px)',
      maxHeight: 'calc(100% - 56px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <StyledContainer sx={{
        display: 'flex',
        width: '80%',
        maxWidth: '600px',
        flexDirection: 'column',
        padding: '24px 40px 24px 40px',
        gap: '16px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.border.table}`,
        background: theme.palette.background.userInputBackground,
        maxHeight: 'calc(100% - 40px)',
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
            currentSettingType === 'models' &&
            <SingleGroupSelect
              label={'Model'}
              value={chatModelValue}
              onValueChange={onChangeChatModel}
              options={modelOptions}
            />
          }
          {
            currentSettingType === 'datasources' &&
            <DatasourceSelect
              required
              onValueChange={onChangeChatDatasource}
              value={conversation.participant.id}
              error={false}
              helperText={''}
            />
          }
          {
            currentSettingType === 'applications' &&
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
          currentSettingType === 'models' && selectedChatModel.model_name &&
          <LLMSettings llmSettings={selectedChatModel} onChangeLLMSettings={onChangeLLMSettings} />
        }
        {
          currentSettingType === 'applications' && !!variables.length &&
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <Typography sx={{ marginLeft: '12px' }} variant='bodySmall' >
              Application variables
            </Typography>
            <VariableList
              variables={variables}
              onChangeVariable={onChangeVariable}
              showexpandicon='true'
              multiline
              collapseContent
            />
          </Box>
        }
      </StyledContainer>
    </Box>
  );
};

export default NewConversationSettings;