import { useTotalCollectionListQuery } from '@/api/collections';
import { useTotalPromptsQuery, useTotalPublicPromptsQuery } from '@/api/prompts';
import {
  MyCollectionStatusOptions,
  MyLibraryTabs,
  MyPromptStatusOptions,
  PromptStatus,
  SearchParams,
  ViewMode,
} from '@/common/constants';
import CommandIcon from '@/components/Icons/CommandIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import FolderIcon from '@/components/Icons/FolderIcon';
import MultipleSelect from '@/components/MultipleSelect';
import StickyTabs from '@/components/StickyTabs';
import ViewToggle from '@/components/ViewToggle';
import useTags from '@/components/useTags';
import RouteDefinitions, { PathSessionMap } from '@/routes';
import styled from '@emotion/styled';
import { Box, useTheme } from '@mui/material';
import {useCallback, useEffect, useMemo, useState} from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthorIdFromUrl, useProjectId, useSortQueryParamsFromUrl, useViewMode } from '../hooks';
import AllStuffList from './AllStuffList';
import CollectionsList from './CollectionsList';
import DataSourcesList from './DataSourcesList';
import PromptsList from './PromptsList';
import { getQueryStatuses } from './useLoadPrompts';
import { useTotalDataSourcesQuery } from '@/api/datasources';
import ApplicationsList from './ApplicationsList';
import ApplicationsIcon from '@/components/Icons/ApplicationsIcon';
import { useTotalApplicationsQuery } from '@/api/applications';

const SelectContainer = styled(Box)(() => (`
  display: flex;
  margin-left: 0.5rem;
  z-index: 1001;
  display: flex;
  align-items: flex-end;
`));

const displayPermissions = {
  prompts: ['models.prompt_lib.prompts.list'],
  collections: ['models.prompt_lib.collections.list'],
  datasources: ['models.datasources.datasources.list'],
  applications: ['models.applications.applications.list'], 
}

export default function MyLibrary({ publicView = false }) {
  const theme = useTheme();
  const { query } = useSelector(state => state.search);
  const { tab = MyLibraryTabs[0] } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = useProjectId();
  const authorId = useAuthorIdFromUrl();
  const location = useLocation();
  const { state } = location;
  const { tagList } = useSelector((storeState) => storeState.prompts);
  const { selectedTagIds } = useTags(tagList);
  const { permissions = [] } = useSelector(s => s.user)

  const viewMode = useViewMode();
  const { sort_by: sortBy, sort_order: sortOrder } = useSortQueryParamsFromUrl({ defaultSortOrder: 'desc', defaultSortBy: 'created_at' })
  const statuses = useMemo(() => {
    const statusesString = publicView ? PromptStatus.Published : searchParams.get(SearchParams.Statuses)
    if (statusesString) {
      return statusesString.split(',');
    }
    return [PromptStatus.All];
  }, [searchParams, publicView]);
  
  const [displayedTabs, setDisplayedTabs] = useState(
    MyLibraryTabs.reduce((acc, i) => ({...acc, [i]: false}), {})
  )
  useEffect(() => {
    const permissionsSet = new Set(permissions)
    setDisplayedTabs(MyLibraryTabs.reduce((acc, i) => {
      const hasPermission = displayPermissions[i] ? displayPermissions[i].some(p => permissionsSet.has(p)) : true
      return {...acc, [i]: hasPermission}
    }, {}))
  }, [permissions]);

  const { data: promptsData } = useTotalPromptsQuery({
    projectId,
    params: {
      tags: selectedTagIds,
      sort_by: sortBy,
      sort_order: sortOrder,
      query,
      statuses: getQueryStatuses(statuses),
    }
  }, { 
    skip: !projectId || viewMode === ViewMode.Public || !displayedTabs.prompts
  });

  const { data: publicPromptsData } = useTotalPublicPromptsQuery({
    projectId,
    params: {
      tags: selectedTagIds,
      sort_by: sortBy,
      sort_order: sortOrder,
      author_id: authorId,
      query,
      statuses: getQueryStatuses(statuses),
    }
  }, { 
    skip: viewMode !== ViewMode.Public 
  });

  const {
    data: collectionData,
  } = useTotalCollectionListQuery({
    projectId,
    params: {
      tags: selectedTagIds,
      query,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
      statuses: getQueryStatuses(statuses),
    }
  }, {
    skip: !projectId || !displayedTabs.collections
  });

  const {
    data: datasourcesData,
  } = useTotalDataSourcesQuery({
    projectId,
    params: {
      tags: selectedTagIds,
      query,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
      statuses: getQueryStatuses(statuses),
    }
  }, {
    skip: !projectId || !displayedTabs.datasources
  });

  const {
    data: applicationsData,
  } = useTotalApplicationsQuery({
    projectId,
    params: {
      tags: selectedTagIds,
      query,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
      statuses: getQueryStatuses(statuses),
    }
  }, {
    skip: !projectId || !displayedTabs.applications
  });

  const promptTotal = viewMode === ViewMode.Owner ? promptsData?.total : publicPromptsData?.total;
  const collectionTotal = collectionData?.total
  const dataSourcesTotal = datasourcesData?.total
  const applicationTotal = applicationsData?.total
  const allTotal = promptTotal + collectionTotal + (dataSourcesTotal || 0) + (applicationTotal || 0);
  const tabs = useMemo(() => {
    const allTabs = [{
      label: MyLibraryTabs[0],
      count: allTotal,
      content: <AllStuffList
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        statuses={statuses}
        displayedTabs={displayedTabs}
      />
    },
      {
        label: MyLibraryTabs[1],
        icon: <CommandIcon fontSize="1rem" />,
        count: promptTotal,
        content: <PromptsList
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          statuses={statuses}
        />
      },
      {
        label: MyLibraryTabs[2],
        icon: <DatabaseIcon />,
        count: dataSourcesTotal,
        content: <DataSourcesList
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          statuses={statuses}
        />,
      },
      {
        label: MyLibraryTabs[3],
        icon: <ApplicationsIcon />,
        count: applicationTotal,
        content: <ApplicationsList
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          statuses={statuses}
        />,
      },
      {
        label: MyLibraryTabs[4],
        icon: <FolderIcon selected />,
        count: collectionTotal,
        content: <CollectionsList
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          statuses={statuses}
        />
      }]
    return allTabs.filter(i => displayedTabs[i.label])
  }, [
    displayedTabs,
    allTotal,
    collectionTotal,
    promptTotal,
    applicationTotal,
    dataSourcesTotal,
    sortBy,
    sortOrder,
    statuses,
    viewMode,
  ]);

  const onChangeStatuses = useCallback(
    (newStatuses) => {
      const newStatusesString = newStatuses.length ? newStatuses.join(',') : 'all';
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(SearchParams.Statuses, newStatusesString);
      setSearchParams(newSearchParams, {
        replace: true,
        state: {
          routeStack: [{
            breadCrumb: PathSessionMap[RouteDefinitions.MyLibrary],
            viewMode,
            pagePath: location.pathname + '?' + newSearchParams.toString(),
          }]
        }
      });
    },
    [location.pathname, searchParams, setSearchParams, viewMode],
  );

  const onChangeTab = useCallback(
    (newTab) => {
      const rootPath = viewMode === ViewMode.Owner ? RouteDefinitions.MyLibrary : RouteDefinitions.UserPublic
      const pagePath = `${rootPath}/${tabs[newTab].label}` + location.search;
      const { routeStack = [] } = state || {};
      const newRouteStack = viewMode === ViewMode.Owner ? [{
        breadCrumb: PathSessionMap[RouteDefinitions.MyLibrary],
        viewMode,
        pagePath
      }] : routeStack;
      if (viewMode === ViewMode.Public && newRouteStack.length) {
        newRouteStack[newRouteStack.length - 1] = {
          ...newRouteStack[newRouteStack.length - 1],
          pagePath,
        }
      }
      navigate(pagePath, {
        state: {
          routeStack: newRouteStack,
        }
      });
    },
    [location.search, navigate, state, tabs, viewMode],
  );

  const currentTabValue = useMemo(() => {
    const foundIndex = tabs.findIndex(item => item.label === tab);
    return foundIndex !== -1 ? foundIndex : 0;
  }, [tab, tabs])

  return (
    <StickyTabs
      tabs={tabs}
      value={currentTabValue}
      onChangeTab={onChangeTab}
      middleTabComponent={
        <>
          {
            viewMode === ViewMode.Owner &&
            <SelectContainer>
              <MultipleSelect
                onValueChange={onChangeStatuses}
                value={statuses}
                options={tab === MyLibraryTabs[4] ? MyCollectionStatusOptions : MyPromptStatusOptions}
                customSelectedColor={`${theme.palette.text.primary} !important`}
                customSelectedFontSize={'0.875rem'}
                multiple={false}
              />
            </SelectContainer>
          }
          <ViewToggle />
        </>
      }
    />
  );
}