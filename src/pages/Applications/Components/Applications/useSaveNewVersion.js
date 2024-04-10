import { useCallback, useEffect } from 'react';
import { buildErrorMessage } from '@/common/utils';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useViewModeFromUrl, useNameFromUrl, useSelectedProjectId, replaceVersionInPath } from '@/pages/hooks';
import { useSaveApplicationNewVersionMutation } from '@/api/applications';
import { alitaApi } from '../../../../api/alitaApi';
import { useDispatch } from 'react-redux';

const useSaveNewVersion = ({ toastError, toastSuccess, applicationId, versionDetails }) => {
  const dispatch = useDispatch();
  const selectedProjectId = useSelectedProjectId();
  const navigate = useNavigate();
  const { state: locationState, pathname, search } = useLocation();
  const { version: currentVersionId } = useParams();
  const viewMode = useViewModeFromUrl();
  const name = useNameFromUrl();

  const [saveNewVersion, {
    isLoading: isSavingNewVersion,
    isSuccess: isSavingNewVersionSuccess,
    data: newVersionData,
    isError: isSavingNewVersionError,
    error,
    reset }] = useSaveApplicationNewVersionMutation();

  const onCreateNewVersion = useCallback(async (newVersionName) => {
    return await saveNewVersion({
      ...(versionDetails || {}),
      name: newVersionName,
      projectId: selectedProjectId,
      applicationId,
    });
  }, [saveNewVersion, versionDetails, selectedProjectId, applicationId]);

  const onSuccess = useCallback(() => {
    if (newVersionData?.id) {
      const newPath = replaceVersionInPath(newVersionData?.id, pathname, currentVersionId, applicationId);
      const routeStack = [...(locationState?.routeStack || [])];
      if (routeStack.length) {
        routeStack[routeStack.length - 1] = {
          ...routeStack[routeStack.length - 1],
          pagePath: `${encodeURI(newPath)}?${search}`,
        }
      } else {
        routeStack.push({
          pagePath: `${encodeURI(newPath)}?${search}`,
          breadCrumb: name,
          viewMode,
        });
      }
      dispatch(alitaApi.util.updateQueryData('applicationDetails', { applicationId, projectId: selectedProjectId }, (details) => {
        details.version_details = newVersionData;
        details.versions = [...details.versions, {
          id: newVersionData.id,
          name: newVersionData.name,
          status: newVersionData.status,
          created_at: newVersionData.created_at,
        }]
      }));
      setTimeout(() => {
        navigate(
          {
            pathname: encodeURI(newPath),
            search
          },
          {
            state: locationState
          });
      }, 100);
      reset();
    }
  }, [
    dispatch,
    currentVersionId,
    locationState,
    name,
    navigate,
    newVersionData,
    pathname,
    applicationId,
    selectedProjectId,
    reset,
    search,
    viewMode]);

  useEffect(() => {
    if (isSavingNewVersionError) {
      toastError(buildErrorMessage(error));
      reset();
    } else if (isSavingNewVersionSuccess) {
      toastSuccess('Saved new version successfully');
      onSuccess();
    }
  }, [error, isSavingNewVersionError, isSavingNewVersionSuccess, onSuccess, reset, toastError, toastSuccess]);

  return {
    onCreateNewVersion,
    isSavingNewVersion,
    isSavingNewVersionError,
    isSavingNewVersionSuccess,
  };
}

export default useSaveNewVersion;