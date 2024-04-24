import { useCallback, useEffect, useState } from "react";
import useToast from './useToast';
import { useLazyDatasourceListQuery } from '@/api/datasources';
import { useLazyApplicationListQuery } from '@/api/applications';
import { useSelectedProjectId } from '@/pages/hooks';
import { useLazyPromptListQuery } from '@/api/prompts';

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
  }] = useLazyPromptListQuery();

  const { rows: promptResult = [], total: promptTotal } = prompt || {};

  const clearPrompts = useCallback(
    () => {
      setCachedPrompts([])
    },
    [],
  )

  useEffect(() => {
    setCachedPrompts(prev => [...prev, ...promptResult])
  }, [promptResult])

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
  }] = useLazyDatasourceListQuery()

  const { rows: datasourceResult = [], total: datasourceTotal } = datasource || {};

  const clearDatasources = useCallback(
    () => {
      setCachedDatasources([])
    },
    [],
  )

  useEffect(() => {
    setCachedDatasources(prev => [...prev, ...datasourceResult])
  }, [datasourceResult])

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
  }] = useLazyApplicationListQuery();

  const { rows: applicationResult = [], total: applicationTotal } = application || {};

  const clearApplications = useCallback(
    () => {
      setCachedApplications([])
    },
    [],
  )

  useEffect(() => {
    setCachedApplications(prev => [...prev, ...applicationResult])
  }, [applicationResult])

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