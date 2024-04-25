import { useCallback, useEffect, useState } from "react";
import useToast from './useToast';
import { useLazyDatasourceListQuery } from '@/api/datasources';
import { useLazyApplicationListQuery } from '@/api/applications';
import { useSelectedProjectId } from '@/pages/hooks';
import { useLazyPromptListQuery } from '@/api/prompts';
import { uniqueObjectArray } from '@/common/utils';

const getErrorMessage = (error) => {
  return error?.data?.message || error?.data?.error
}
export default function useChatSearch() {
  const { ToastComponent: ApiToast, toastError } = useToast({ topPosition: '10px' });
  const projectId = useSelectedProjectId();
  const [cachedPrompts, setCachedPrompts] = useState([])
  const [cachedDatasources, setCachedDatasources] = useState([])
  const [cachedApplications, setCachedApplications] = useState([])

  const [getPromptsSuggestion, {
    data: prompt = {},
    isFetching: isFetchingPrompts,
    error: promptSuggestionError,
    isSuccess: isPromptSuccess, 
  }] = useLazyPromptListQuery();

  const { rows: promptResult = [], total: promptTotal } = prompt || {};

  const clearPrompts = useCallback(
    () => {
      setCachedPrompts([])
    },
    [],
  )

  useEffect(() => {
    if (isPromptSuccess) {
      setCachedPrompts(prev => uniqueObjectArray([...prev, ...promptResult], 'id'))
    }
  }, [isPromptSuccess, promptResult])

  useEffect(() => {
    if (isFetchingPrompts) return;
    if (promptSuggestionError) {
      toastError('Get Prompts Suggestion Error: ' + getErrorMessage(promptSuggestionError));
    }
  }, [isFetchingPrompts, promptSuggestionError, toastError]);

  const [getDatasourcesSuggestion, {
    data: datasource = {},
    isFetching: isFetchingDatasources,
    error: datasourceSuggestionError,
    isSuccess: isDatasourceSuccess,
  }] = useLazyDatasourceListQuery()

  const { rows: datasourceResult = [], total: datasourceTotal } = datasource || {};

  const clearDatasources = useCallback(
    () => {
      setCachedDatasources([])
    },
    [],
  )

  useEffect(() => {
    if (isDatasourceSuccess) {
      setCachedDatasources(prev => uniqueObjectArray([...prev, ...datasourceResult], 'id'))
    }
  }, [datasourceResult, isDatasourceSuccess])

  useEffect(() => {
    if (isFetchingDatasources) return;
    if (datasourceSuggestionError) {
      toastError('Get Datasources Suggestion Error: ' + getErrorMessage(datasourceSuggestionError));
    }
  }, [isFetchingDatasources, datasourceSuggestionError, toastError]);

  const [getApplicationSuggestion, {
    data: application = {},
    isFetching: isFetchingApplications,
    error: applicationSuggestionError,
    isSuccess: isApplicationSuccess,
  }] = useLazyApplicationListQuery();

  const { rows: applicationResult = [], total: applicationTotal } = application || {};

  const clearApplications = useCallback(
    () => {
      setCachedApplications([])
    },
    [],
  )

  useEffect(() => {
    if (isApplicationSuccess) {
      setCachedApplications(prev => uniqueObjectArray([...prev, ...applicationResult], 'id'))
    }
  }, [applicationResult, isApplicationSuccess])

  useEffect(() => {
    if (isFetchingApplications) return;
    if (applicationSuggestionError) {
      toastError('Get Datasources Suggestion Error: ' + getErrorMessage(applicationSuggestionError));
    }
  }, [isFetchingApplications, applicationSuggestionError, toastError]);

  return {
    projectId,
    ApiToast,
    getPromptsSuggestion,
    clearPrompts,
    isFetchingPrompts,
    promptResult: cachedPrompts,
    promptTotal,
    getDatasourcesSuggestion,
    clearDatasources,
    isFetchingDatasources,
    datasourceResult: cachedDatasources,
    datasourceTotal,
    getApplicationSuggestion,
    clearApplications,
    isFetchingApplications,
    applicationResult: cachedApplications,
    applicationTotal
  }
}