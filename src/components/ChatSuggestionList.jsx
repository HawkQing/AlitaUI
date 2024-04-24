import {
  AutoChatSuggestionTitles,
  SortFields,
  SortOrderOptions
} from '@/common/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ListSection, StyledList, StyledListItem } from './SearchBarComponents';
import useChatSearch from './useChatSearch';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function ChatSuggestionList({
  searchString,
  isEmptyInput,
}) {
  const {
    projectId,
    ApiToast,
    getPromptsSuggestion,
    clearPrompts,
    isFetchingPrompts,
    promptResult,
    promptTotal,
    getDatasourcesSuggestion,
    clearDatasources,
    isFetchingDatasources,
    datasourceResult,
    datasourceTotal,
    getApplicationSuggestion,
    clearApplications,
    isFetchingApplications,
    applicationResult,
    applicationTotal
  } = useChatSearch();

  const [promptPage, setPromptPage] = useState(0);
  const getPrompts = useCallback((inputValue, page) => {
    getPromptsSuggestion({
      projectId,
      page: page === undefined ? promptPage : page,
      params: {
        query: inputValue,
        sort: SortFields.Id,
        order: SortOrderOptions.DESC,
      }
    });
  }, [getPromptsSuggestion, projectId, promptPage])
  const getPromptsRef = useRef(getPrompts);
  useEffect(() => {
    getPromptsRef.current = getPrompts
  }, [getPrompts])
  

  const fetchMorePromptData = useCallback(() => {
    setPromptPage(prev => prev + 1);
  }, []);

  const [datasourcePage, setDatasourcePage] = useState(0)
  const getDatasources = useCallback((inputValue, page) => {
    getDatasourcesSuggestion({
      projectId,
      page: page === undefined ? datasourcePage : page,
      params: {
        query: inputValue,
        sort: SortFields.Id,
        order: SortOrderOptions.DESC,
      }
    });
  }, [getDatasourcesSuggestion, projectId, datasourcePage])
  const getDatasourcesRef = useRef(getDatasources);
  useEffect(() => {
    getDatasourcesRef.current = getDatasources
  }, [getDatasources])

  const fetchMoreDatasourceData = useCallback(() => {
    setDatasourcePage(prev => prev + 1);
  }, []);

  const [applicationPage, setApplicationPage] = useState(0)
  const getApplications = useCallback((inputValue, page) => {
    getApplicationSuggestion({
      projectId,
      page: page === undefined ? applicationPage : page,
      params: {
        query: inputValue,
        sort: SortFields.Id,
        order: SortOrderOptions.DESC,
      }
    });
  }, [getApplicationSuggestion, projectId, applicationPage])
  const getApplicationsRef = useRef(getApplications);
  useEffect(() => {
    getApplicationsRef.current = getApplications
  }, [getApplications])

  const fetchMoreApplicationData = useCallback(() => {
    setApplicationPage(prev => prev + 1);
  }, []);

  const debouncedInputValue = useDebounce(searchString, 500);
  useEffect(() => {
    if (!isEmptyInput) {
      setPromptPage(0)
      setDatasourcePage(0)
      setApplicationPage(0)
      clearPrompts()
      clearApplications()
      clearDatasources()
      getPromptsRef.current(debouncedInputValue, 0);
      getDatasourcesRef.current(debouncedInputValue, 0);
      getApplicationsRef.current(debouncedInputValue, 0);
    }
  }, [isEmptyInput, debouncedInputValue, clearPrompts, clearApplications, clearDatasources]);

  useEffect(() => {
    if (promptPage > 0) {
      getPrompts(searchString);
    }
  }, [getPrompts, promptPage, searchString]);

  useEffect(() => {
    if (datasourcePage > 0) {
      getDatasources(searchString);
    }
  }, [datasourcePage, getDatasources, searchString]);

  useEffect(() => {
    if (applicationPage > 0) {
      getApplications(searchString);
    }
  }, [applicationPage, getApplications, searchString]);

  const renderItem = useCallback((item) => {
    // eslint-disable-next-line react/jsx-no-bind, no-console
    return <StyledListItem key={item.id} onClick={() => console.log('select=======>', item.name)}>
      {item.name}
    </StyledListItem>
  }, []);

  return (
    <StyledList>
      <ListSection
        sectionTitle={AutoChatSuggestionTitles.PROMPTS}
        data={promptResult}
        total={promptTotal}
        isFetching={isFetchingPrompts}
        renderItem={renderItem}
        fetchMoreData={fetchMorePromptData}
      />
      <ListSection
        sectionTitle={AutoChatSuggestionTitles.DATASOURCES}
        data={datasourceResult}
        total={datasourceTotal}
        isFetching={isFetchingDatasources}
        renderItem={renderItem}
        fetchMoreData={fetchMoreDatasourceData}
      />
      <ListSection
        sectionTitle={AutoChatSuggestionTitles.APPLICATIONS}
        data={applicationResult}
        total={applicationTotal}
        isFetching={isFetchingApplications}
        renderItem={renderItem}
        fetchMoreData={fetchMoreApplicationData}
      />
      <ApiToast />
    </StyledList>
  )
}