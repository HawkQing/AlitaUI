import { useApplicationDetailsQuery } from "@/api/applications.js";
import { useGetModelsQuery } from '@/api/integrations';
import {
  CapabilityTypes,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  PROMPT_PAYLOAD_KEY
} from '@/common/constants.js';
import { getIntegrationData, getIntegrationOptions } from "@/pages/DataSources/utils.js";
import { useProjectId, useSelectedProjectId } from "@/pages/hooks.jsx";
import { useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

const applicationCapabilities = [CapabilityTypes.chat_completion.value]

const getModelSettings = (data = [], applicationData) => {
  const matchedData = getIntegrationData(data, applicationCapabilities)
  const { llm_settings } = applicationData?.version_details || {};
  let integrationUid = llm_settings?.integration_uid;
  let targetData = matchedData.find((item) => item?.uid === integrationUid);

  if (!targetData) {
    targetData = matchedData?.[0]
    integrationUid = matchedData?.[0]?.uid
  }

  if (targetData) {
    const newModelSettings = {
      max_tokens: llm_settings?.max_tokens ?? DEFAULT_MAX_TOKENS,
      top_p: llm_settings?.top_p ?? (targetData.settings?.top_p || DEFAULT_TOP_P),
      top_k: llm_settings?.top_k ?? (targetData.settings?.top_k || DEFAULT_TOP_K),
      temperature: llm_settings?.temperature ?? (targetData.settings?.temperature || DEFAULT_TEMPERATURE),
      [PROMPT_PAYLOAD_KEY.integrationUid]: integrationUid,
      [PROMPT_PAYLOAD_KEY.modelName]: llm_settings?.model_name,
    }

    const models = targetData?.settings?.models || [];
    if (models.length && !models.find(model => model === llm_settings?.model_name)) {
      const matchedModel = models?.find(model => model.capabilities.chat_completion);
      newModelSettings.model_name = matchedModel?.id
    }
    return newModelSettings
  }
  return {}
}

export const useCreateApplicationInitialValues = () => {
  const selectedProjectId = useSelectedProjectId();
  const { data: modelsData = [] } = useGetModelsQuery(selectedProjectId, { skip: !selectedProjectId });
  const modelOptions = useMemo(() => getIntegrationOptions(modelsData, applicationCapabilities), [modelsData]);
  const initialValues = useMemo(() => ({
    name: '',
    description: '',
    type: 'interface',
    versions: [
      {
        name: 'latest',
        tags: []
      }
    ],
    version_details: {
      conversation_starters: [],
      llm_settings: getModelSettings(modelsData),
      instructions: '',
      variables: [],
      tools: [],
    },
  }), [modelsData])
  return {
    modelOptions,
    initialValues
  }
}

export const useFormikFormRef = () => {
  const formRef = useRef();
  const getFormValues = useCallback(() => formRef?.current?.values || {}, []);
  const resetFormValues = useCallback(() => formRef.current?.resetForm(), []);
  return {
    formRef,
    getFormValues,
    resetFormValues
  }
}

const useApplicationInitialValues = () => {
  const currentProjectId = useProjectId()
  const { applicationId } = useParams();
  const { data: applicationData = {}, isFetching } =
    useApplicationDetailsQuery(
      { projectId: currentProjectId, applicationId },
      { skip: !currentProjectId || !applicationId });
  const { data: modelsData = [] } = useGetModelsQuery(currentProjectId,
    { skip: !currentProjectId || !applicationData?.id });
  const modelOptions = useMemo(() => getIntegrationOptions(modelsData, applicationCapabilities), [modelsData]);
  const initialValues = useMemo(() => applicationData, [applicationData])
  return {
    isFetching,
    modelOptions,
    initialValues,
    applicationId,
  }
}

export default useApplicationInitialValues;