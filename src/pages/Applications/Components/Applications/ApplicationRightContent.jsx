import {
  ChatBoxMode,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  PROMPT_PAYLOAD_KEY
} from '@/common/constants.js';
import { ContentContainer, RightGridItem } from "@/pages/Prompts/Components/Common.jsx";
import AdvancedSettings from "@/pages/Prompts/Components/Form/AdvancedSettings.jsx";
import { RightContent } from "@/pages/Prompts/Components/RunTab.jsx";
import { useIsSmallWindow } from "@/pages/hooks.jsx";
import { useFormikContext } from 'formik';
import { useCallback, useMemo } from "react";


export default function ApplicationRightContent({
  setShowAdvancedSettings,
  lgGridColumns,
  showAdvancedSettings,
  isFullScreenChat,
  setIsFullScreenChat,
  modelOptions
}) {
  const { values: formValues, initialValues, setFieldValue } = useFormikContext();
  const setFormValue = useCallback((key, value) => {
    setFieldValue('version_details.llm_settings.' + key, value);
  }, [setFieldValue]);

  const {
    instructions: context = '',
    messages = [],
    variables = [],
    llm_settings = {},
    type = ChatBoxMode.Chat,
  } = formValues?.version_details || {};

  const mappedVariables = useMemo(() => variables.map(v => ({ key: v.name, value: v.value, id: v.id })), [variables])

  const {
    model_name,
    integration_uid,
    max_tokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    top_p = DEFAULT_TOP_P,
    top_k,
  } = llm_settings;

  const { conversation_starters: conversationStarters = [] } =
    useMemo(() => initialValues?.version_details || {},
      [initialValues?.version_details]);

  const { isSmallWindow } = useIsSmallWindow();

  const onOpenAdvancedSettings = useCallback(() => {
    setShowAdvancedSettings(true);
  }, [setShowAdvancedSettings]);

  const onCloseAdvanceSettings = useCallback(() => {
    setShowAdvancedSettings(false);
  }, [setShowAdvancedSettings]);

  const onChangeVariable = useCallback((label, newValue) => {
    const updateIndex = variables.findIndex(variable => variable.name === label);
    setFieldValue(`version_details.variables`, variables.map((v, index) => index === updateIndex ? ({ name: label, value: newValue }) : v));
  }, [setFieldValue, variables])

  const onChange = useCallback(
    (key) => (value) => {
      setFormValue(key, value);
    },
    [setFormValue]
  );

  const onChangeModel = useCallback(
    (integrationUid, model) => {
      setFormValue(PROMPT_PAYLOAD_KEY.integrationUid, integrationUid);
      setFormValue(PROMPT_PAYLOAD_KEY.modelName, model);
    },
    [setFormValue]
  );

  const settings = useMemo(() => ({
    prompt_id: 1,
    chatOnly: true,
    integration_uid,
    model_name,
    temperature,
    context,
    messages,
    max_tokens,
    top_p,
    top_k,
    variables: mappedVariables,
    type,
    conversationStarters,
    isFullScreenChat,
    setIsFullScreenChat,
  }), [
    integration_uid,
    model_name,
    temperature,
    context,
    messages,
    max_tokens,
    top_p,
    top_k,
    mappedVariables,
    type,
    conversationStarters,
    isFullScreenChat,
    setIsFullScreenChat,
  ]);

  return (
    <>
      <RightGridItem item xs={12} lg={lgGridColumns} sx={{ paddingBottom: '10px' }}>
        <ContentContainer sx={settings?.isFullScreenChat ? { height: 'calc(100vh - 165px)' } : undefined}>
          <RightContent
            variables={mappedVariables}
            onChangeVariable={onChangeVariable}
            onOpenAdvancedSettings={onOpenAdvancedSettings}
            showAdvancedSettings={showAdvancedSettings}
            isSmallWindow={isSmallWindow}
            //below are props for advanced settings
            onCloseAdvanceSettings={onCloseAdvanceSettings}
            settings={settings}
            onChangeSettings={onChange}
            onChangeModel={onChangeModel}
            modelOptions={modelOptions}
            showClearChatOnSettings
          />
        </ContentContainer>
      </RightGridItem>

      {showAdvancedSettings && !isSmallWindow && (
        <AdvancedSettings
          onCloseAdvanceSettings={onCloseAdvanceSettings}
          settings={settings}
          onChangeSettings={onChange}
          onChangeModel={onChangeModel}
          modelOptions={modelOptions}
        />
      )}
    </>
  )
}