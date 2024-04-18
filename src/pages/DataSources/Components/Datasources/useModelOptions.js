import { useGetModelsQuery } from '@/api/integrations';
import { useSelectedProjectId } from '@/pages/hooks';
import { useEffect, useState, useMemo } from 'react';
import { getIntegrationOptions } from "@/pages/DataSources/utils.js";
import { PUBLIC_PROJECT_ID } from '@/common/constants';

const useModelOptions = ({ usePublicProjectId } = {}) => {
  const selectedProjectId = useSelectedProjectId();
  const projectId = useMemo(() => usePublicProjectId ? PUBLIC_PROJECT_ID : selectedProjectId, [selectedProjectId, usePublicProjectId])
  const { isSuccess, data: integrations } = useGetModelsQuery(projectId, { skip: !projectId });
  const [modelOptions, setModelOptions] = useState({});
  const [embeddingModelOptions, setEmbeddingModelOptions] = useState({})
  useEffect(() => {
    if (isSuccess && integrations) {
      setModelOptions(getIntegrationOptions(integrations, ['chat_completion', 'completion']));
      setEmbeddingModelOptions(getIntegrationOptions(integrations, ['embeddings']));
    }
  }, [integrations, isSuccess]);

  return {
    modelOptions,
    embeddingModelOptions,
  }
}

export default useModelOptions;