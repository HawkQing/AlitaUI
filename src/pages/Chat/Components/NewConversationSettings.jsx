import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { StatusDot } from '@/components/StatusDot';
import {
  PromptStatus,
  PROMPT_PAYLOAD_KEY,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE
} from '@/common/constants';
import GroupedButton from '@/components/GroupedButton';
import useModelOptions from '@/pages/DataSources/Components/Datasources/useModelOptions';
import SingleGroupSelect from '@/components/SingleGroupSelect';
import { genModelSelectValue, getIntegrationNameByUid } from '@/common/promptApiUtils';
import DatasourceSelect from '@/pages/Applications/Components/Tools/DatasourceSelect';
import ApplicationSelect from './ApplicationSelect';
import { useTheme } from '@emotion/react';
import StyledInputEnhancer from '@/components/StyledInputEnhancer';
import {
  AdvanceSettingInputContainer,
  AdvanceSettingSliderContainer
} from '@/pages/Prompts/Components/Form/AdvancedSettings';
import Slider from '@/components/Slider';

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
  is_public,
  setIsPublic,
  selectedChatModel,
  setSelectedChatModel,
  llm_settings = {},
  onChangeLLMSettings,
  selectedChatDatasource,
  setSelectedChatDatasource,
  selectedChatApplication,
  setSelectedChatApplication,
}) => {
  const focusOnMaxTokens = useRef(false);

  const theme = useTheme();
  const { modelOptions } = useModelOptions();
  const [currentSettingType, setCurrentSettingType] = useState('model')
  const [conversationName, setConversationName] = useState('New Conversation')
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
    setIsPublic(event.target.value);
  }, [setIsPublic]);

  const onSelectParticipantType = useCallback(
    (e) => {
      const newType = e?.target?.value;
      if (currentSettingType !== newType) {
        setCurrentSettingType(newType);
      }
    },
    [currentSettingType],
  );

  const onChangeName = useCallback((event) => {
    setConversationName(event.target.value);
  }, []);

  const onChangeChatModel = useCallback((integrationUid, modelName) => {
    setSelectedChatModel({
      integration_uid: integrationUid,
      model_name: modelName,
    });
  }, [setSelectedChatModel])

  const onChangeChatDatasource = useCallback((datasource) => {
    setSelectedChatDatasource(datasource);
  }, [setSelectedChatDatasource]);

  const onChangeChatApplication = useCallback((application) => {
    setSelectedChatApplication(application);
  }, [setSelectedChatApplication]);

  const [maxTokens, setMaxTokens] = useState(llm_settings?.max_tokens || DEFAULT_MAX_TOKENS);

  const onMaxTokensBlur = useCallback(
    () => {
      focusOnMaxTokens.current = false;
      setTimeout(() => {
        if (!focusOnMaxTokens.current && !maxTokens) {
          onChangeLLMSettings(PROMPT_PAYLOAD_KEY.maxTokens)(DEFAULT_MAX_TOKENS);
          setMaxTokens(DEFAULT_MAX_TOKENS);
        } else {
          if (maxTokens !== llm_settings?.max_tokens) {
            onChangeLLMSettings(PROMPT_PAYLOAD_KEY.maxTokens)(parseInt(maxTokens));
          }
        }
      }, 50);
    },
    [llm_settings?.max_tokens, maxTokens, onChangeLLMSettings],
  );

  const onMaxTokensFocus = useCallback(
    () => {
      focusOnMaxTokens.current = true;
    },
    [],
  );

  const onInputMaxTokens = useCallback((event) => {
    event.preventDefault();
    setMaxTokens(event.target.value);
  }, []);

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
            value={conversationName}
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
            value={is_public}
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
              value={selectedChatDatasource}
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
              value={selectedChatApplication}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
        </Box>
        {
          currentSettingType === 'model' && selectedChatModel.model_name &&
          <Box>
            <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important' }}>
              <Slider
                label='Temperature (0.1 - 1.0)'
                value={llm_settings.temperature ?? DEFAULT_TEMPERATURE}
                step={0.1}
                range={[0.1, 1]}
                onChange={onChangeLLMSettings(PROMPT_PAYLOAD_KEY.temperature)}
              />
            </AdvanceSettingSliderContainer>
            <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important' }}>
              <Slider
                label='Top P (0-1)'
                value={+(llm_settings.top_p ?? DEFAULT_TOP_P)}
                range={[0, 1]}
                onChange={onChangeLLMSettings(PROMPT_PAYLOAD_KEY.topP)}
              />
            </AdvanceSettingSliderContainer>
            <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important' }}>
              <Slider
                label='Top K'
                value={+(llm_settings.top_k ?? DEFAULT_TOP_K)}
                step={1}
                range={[1, 40]}
                onChange={onChangeLLMSettings(PROMPT_PAYLOAD_KEY.topK)}
              />
            </AdvanceSettingSliderContainer>
            <AdvanceSettingInputContainer sx={{ paddingRight: '0 !important' }}>
              <StyledInputEnhancer
                onBlur={onMaxTokensBlur}
                onFocus={onMaxTokensFocus}
                onInput={onInputMaxTokens}
                value={maxTokens}
                id="max_tokens"
                type="number"
                label="Maximum length"
                variant="standard"
                placeholder="Input maximum length here"
                fullWidth
              />
            </AdvanceSettingInputContainer>
          </Box>
        }
      </Box>
    </Box>
  );
};

export default NewConversationSettings;