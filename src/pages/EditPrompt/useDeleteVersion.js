import { useDeleteVersionMutation } from '@/api/prompts';
import { useEffect, useCallback } from 'react';
import { buildErrorMessage } from '@/common/utils';
import { useProjectId, useFromMyLibrary, useCollectionFromUrl, useNameFromUrl, useViewModeFromUrl } from '../hooks';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RouteDefinitions from '@/routes';
import { SearchParams } from '@/common/constants';

const useDeleteVersion = (currentVersionId, promptId, setOpenToast, setToastSeverity, setToastMessage) => {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const { versions } = useSelector((state) => state.prompts);
  const isFromMyLibrary = useFromMyLibrary();
  const collection = useCollectionFromUrl();
  const { tab, collectionId } = useParams();
  const promptName = useNameFromUrl();
  const { state } = useLocation();
  const viewMode = useViewModeFromUrl();

  const [deleteVersion, {
    isLoading: isDeletingVersion,
    isSuccess: isDeleteVersionSuccess,
    isError: isDeleteVersionError,
    error: deleteVersionError,
    reset: resetDeleteVersion }] = useDeleteVersionMutation();

  useEffect(() => {
    if (isDeleteVersionSuccess || isDeleteVersionError) {
      setOpenToast(true);
    }
    if (isDeleteVersionError) {
      setToastSeverity('error');
      setToastMessage(buildErrorMessage(deleteVersionError));
    } else if (isDeleteVersionSuccess) {
      setToastSeverity('info');
      setToastMessage('Version has been deleted!');
    }
  }, [
    isDeleteVersionSuccess,
    isDeleteVersionError,
    deleteVersionError,
    setOpenToast,
    setToastSeverity,
    setToastMessage]);

  const doDeleteVersion = useCallback(
    async () => {
      await deleteVersion({ promptId, projectId, version: currentVersionId })
    },
    [currentVersionId, deleteVersion, projectId, promptId],
  );

  const handleDeleteSuccess = useCallback(
    () => {
      const newVersion = versions.find(item => item.name === 'latest') || versions.find(item => item.id !== currentVersionId);
      if (newVersion) {
        const pathname = isFromMyLibrary ?
          collectionId ?
            `${RouteDefinitions.MyLibrary}/collections/${collectionId}/prompts/${promptId}/${encodeURIComponent(newVersion.name)}`
            :
            `${RouteDefinitions.MyLibrary}/prompts/${promptId}/${encodeURIComponent(newVersion.name)}`
          :
          tab ?
            `${RouteDefinitions.Prompts}/${tab}/${promptId}/${encodeURIComponent(newVersion.name)}`
            :
            `${RouteDefinitions.Prompts}/${promptId}/${encodeURIComponent(newVersion.name)}`;
        const search = isFromMyLibrary ?
          collectionId ?
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}&${SearchParams.Collection}=${encodeURIComponent(collection)}`
            :
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}`
          :
          tab ?
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}`
            :
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}`

        navigate(
          {
            pathname: encodeURI(pathname),
            search,
          },
          {
            state,
            replace: true,
          });
      } else {
        const pathname = isFromMyLibrary ?
          collectionId ?
            `${RouteDefinitions.MyLibrary}/collections/${collectionId}`
            :
            `${RouteDefinitions.MyLibrary}/prompts`
          :
          tab ?
            `${RouteDefinitions.Prompts}/${tab}`
            :
            `${RouteDefinitions.Prompts}`;
        const search = isFromMyLibrary ?
          collectionId ?
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}&${SearchParams.Collection}=${encodeURIComponent(collection)}`
            :
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}`
          :
          tab ?
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}`
            :
            `${SearchParams.ViewMode}=${viewMode}&${SearchParams.Name}=${encodeURIComponent(promptName)}`;
        navigate(
          {
            pathname: encodeURI(pathname),
            search,
          },
          {
            state,
            replace: true,
          });
      }
      resetDeleteVersion();
    },
    [
      collection,
      collectionId,
      currentVersionId,
      isFromMyLibrary,
      navigate,
      promptId,
      promptName,
      resetDeleteVersion,
      state,
      tab,
      versions,
      viewMode
    ]
  );

  const onFinishDeleteVersion = useCallback(
    () => {
      if (isDeleteVersionError) {
        resetDeleteVersion();
      } else if (isDeleteVersionSuccess) {
        handleDeleteSuccess();
      }
    },
    [handleDeleteSuccess, isDeleteVersionError, isDeleteVersionSuccess, resetDeleteVersion]);

  return {
    doDeleteVersion,
    isDeletingVersion,
    resetDeleteVersion,
    onFinishDeleteVersion,
    isDeleteVersionError,
    isDeleteVersionSuccess
  };
}

export default useDeleteVersion;