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
  ChatParticipantType,
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
import { useSelectedProjectId } from '@/pages/hooks';
import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import DatasourceSettings from './DatasourceSettings';
import { updateObjectByPath } from '@/common/utils.jsx';

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
  value: ChatParticipantType.Models,
}, {
  label: 'Datasource',
  value: ChatParticipantType.Datasources,
}, {
  label: 'Application',
  value: ChatParticipantType.Applications,
}]
const datasourcePrefixPath = 'version_details.datasource_settings.chat.'

const NewConversationSettings = ({
  conversation,
  onChangeConversation,
}) => {
  const theme = useTheme();
  const conversationRef = useRef(conversation);
  const { modelOptions } = useModelOptions();
  const [currentSettingType, setCurrentSettingType] = useState(ChatParticipantType.Models)
  const projectId = useSelectedProjectId();

  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  useEffect(() => {
    setCurrentSettingType(conversation?.participants[0]?.type || ChatParticipantType.Models);
  }, [conversation?.participants])

  const selectedChatModel = useMemo(() => conversation?.participants[0]?.type ===ChatParticipantType.Models ? conversation?.participants[0] || {} : {}, [conversation?.participants])
  const chatModelValue = useMemo(() =>
  (
    selectedChatModel.integration_uid &&
      selectedChatModel.model_name ?
      genModelSelectValue(selectedChatModel.integration_uid,
        selectedChatModel.model_name,
        getIntegrationNameByUid(selectedChatModel.integration_uid, modelOptions))
      : ''),
    [modelOptions, selectedChatModel.integration_uid, selectedChatModel.model_name]);
  const { getApplicationDetail, applicationDetail, isFetching: isFetchingApplicationDetail } = useQueryApplicationDetail();
  const { getDatasourceDetail, datasourceDetail, isFetching: isFetchingDatasourceDetail } = useQueryDataSourceDetail();
  const isFetching = useMemo(() => isFetchingApplicationDetail || isFetchingDatasourceDetail, [isFetchingApplicationDetail, isFetchingDatasourceDetail])
  const variables = useMemo(() => conversation?.participants[0]?.version_details?.variables || [], [conversation?.participants])

  useEffect(() => {
    if (applicationDetail?.version_details) {
      onChangeConversation({
        ...conversationRef.current,
        participants: [{
          ...conversationRef.current.participants[0],
          version_details: applicationDetail.version_details,
          versions: applicationDetail.versions,
        }],
      })
    }
  }, [applicationDetail?.version_details, applicationDetail?.version_details.variables, applicationDetail?.versions, onChangeConversation])

  useEffect(() => {
    if (datasourceDetail?.version_details) {
      onChangeConversation({
        ...conversationRef.current,
        participants: [{
          ...conversationRef.current.participants[0],
          version_details: datasourceDetail.version_details,
          versions: datasourceDetail.versions,
        }],
      })
    }
  }, [
    datasourceDetail?.version_details,
    datasourceDetail?.versions,
    onChangeConversation
  ])


  const onSwitchPublicPrivate = useCallback((event) => {
    onChangeConversation({
      ...conversation,
      is_public: event.target.value
    })
  }, [conversation, onChangeConversation]);

  const onSelectParticipantType = useCallback(
    (e) => {
      const newType = e?.target?.value;
      setCurrentSettingType(newType);
    },
    [],
  );

  const onChangeName = useCallback((event) => {
    onChangeConversation({
      ...conversation,
      name: event.target.value,
    })
  }, [conversation, onChangeConversation]);

  const onChangeChatModel = useCallback((integrationUid, modelName, integrationName) => {
    onChangeConversation({
      ...conversation,
      participants: [{
        ...conversation?.participants[0],
        type: ChatParticipantType.Models,
        id: integrationUid + '_' + modelName,
        integration_uid: integrationUid,
        model_name: modelName,
        max_tokens: DEFAULT_MAX_TOKENS,
        top_p: DEFAULT_TOP_P,
        top_k: DEFAULT_TOP_K,
        temperature: DEFAULT_TEMPERATURE,
        integration_name: integrationName,
      }],
    })
  }, [conversation, onChangeConversation])

  const onChangeLLMSettings = useCallback(
    (field) => (value) => {
      onChangeConversation({
        ...conversation,
        participants: [{
          ...conversation?.participants[0],
          [field]: value
        }],
      })
    },
    [conversation, onChangeConversation],
  )

  const onDatasourceSettings = useCallback(
    (field) => (value) => {
      const newDatasource = updateObjectByPath(conversation?.participants[0], datasourcePrefixPath + field, value)
      onChangeConversation({
        ...conversation,
        type: ChatParticipantType.Datasources,
        participants: [newDatasource],
      })
    },
    [conversation, onChangeConversation],
  )

  const onChangeChatDatasource = useCallback((datasource) => {
    onChangeConversation({
      ...conversation,
      participants: [{
        ...conversation?.participants[0],
        type: ChatParticipantType.Datasources,
        name: datasource.label,
        id: datasource.value,
        description: datasource.description,
      }],
    })
    getDatasourceDetail({ projectId, datasourceId: datasource.value })
  }, [conversation, getDatasourceDetail, onChangeConversation, projectId]);

  const onChangeChatApplication = useCallback((application) => {
    onChangeConversation({
      ...conversation,
      participants: [{
        ...conversation?.participants[0],
        type: ChatParticipantType.Applications,
        name: application.label,
        id: +application.value,
        description: application.description,
        variables: [],
      }],
    })
    getApplicationDetail({ projectId, applicationId: application.value })
  }, [conversation, getApplicationDetail, onChangeConversation, projectId]);

  const onChangeVariable = useCallback((label, newValue) => {
    onChangeConversation({
      ...conversation,
      participants: [{
        ...conversation?.participants[0],
        version_details: {
          ...conversation?.participants[0]?.version_details,
          variables: conversation?.participants[0]?.version_details.variables.map((v) => v.name === label ? ({ name: label, value: newValue }) : v)
        }
      }],
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
            value={conversation?.name || ''}
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
            value={conversation?.is_public}
            onChange={onSwitchPublicPrivate}
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
            currentSettingType === ChatParticipantType.Models &&
            <SingleGroupSelect
              label={'Model'}
              value={chatModelValue}
              onValueChange={onChangeChatModel}
              options={modelOptions}
            />
          }
          {
            currentSettingType === ChatParticipantType.Datasources &&
            <DatasourceSelect
              required
              onValueChange={onChangeChatDatasource}
              value={
                conversation?.participants[0]?.type === ChatParticipantType.Datasources
                  ?
                  conversation?.participants[0]?.id || ''
                  :
                  ''}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
          {
            currentSettingType === ChatParticipantType.Applications &&
            <ApplicationSelect
              required
              onValueChange={onChangeChatApplication}
              value={
                conversation?.participants[0]?.type === ChatParticipantType.Applications
                  ?
                  conversation?.participants[0]?.id || ''
                  :
                  ''}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
        </Box>
        {
          currentSettingType === ChatParticipantType.Models && selectedChatModel.model_name &&
          <LLMSettings llmSettings={selectedChatModel} onChangeLLMSettings={onChangeLLMSettings} />
        }
        {
          conversation?.participants[0]?.type === ChatParticipantType.Datasources &&
          currentSettingType === ChatParticipantType.Datasources &&
          conversation?.participants[0]?.id &&
          !isFetching &&
          <DatasourceSettings
            chat_settings_ai={conversation?.participants[0]?.version_details?.datasource_settings?.chat?.chat_settings_ai}
            chat_settings_embedding={conversation?.participants[0]?.version_details?.datasource_settings?.chat?.chat_settings_embedding}
            onDatasourceSettings={onDatasourceSettings}
          />
        }
        {
          isFetching &&
          <Box sx={{ position: 'relative', width: '100%', height: '30px' }}>
            <StyledCircleProgress size={24} />
          </Box>
        }
        {
          currentSettingType === ChatParticipantType.Applications && !!variables.length && !isFetching &&
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            maxHeight: '220px',
            overflowY: 'scroll',
            '&::-webkit-scrollbar': {
              display: 'none',
              width: '0 !important;',
              height: '0;',
            },
            scrollbarWidth: 'none', // For Firefox
            msOverflowStyle: 'none',  // For Internet Explorer and Edge
          }}>
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