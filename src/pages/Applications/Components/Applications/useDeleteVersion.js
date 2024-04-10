import { useDeleteApplicationVersionMutation } from '@/api/applications';
import { useEffect, useCallback, useMemo } from 'react';
import { buildErrorMessage } from '@/common/utils';
import { replaceVersionInPath, useSelectedProjectId } from '@/pages/hooks';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const useReplaceVersionInPath = (versions, currentVersionId) => {
  const { pathname, search } = useLocation();
  const { applicationId, version } = useParams();
  const newVersionId = useMemo(() => {
    const newVersion = versions?.find(item => item.name === 'latest') || versions.find(item => item.id !== currentVersionId);
    return newVersion?.id;
  }, [currentVersionId, versions]);

  const newPath = useMemo(() => {
    return replaceVersionInPath(newVersionId, pathname, version, applicationId);
  }, [newVersionId, pathname, applicationId, version]);
  return { newPath, search }
}

const useDeleteVersion = ({ versionId, applicationId, toastError, toastInfo, versions }) => {
  const navigate = useNavigate();
  const projectId = useSelectedProjectId();
  const { state } = useLocation();

  const [deleteVersion, {
    isLoading: isDeletingVersion,
    isSuccess: isDeleteVersionSuccess,
    isError: isDeleteVersionError,
    error: deleteVersionError,
    reset: resetDeleteVersion }] = useDeleteApplicationVersionMutation();

  const doDeleteVersion = useCallback(
    async () => {
      await deleteVersion({ applicationId, projectId, versionId })
    },
    [versionId, deleteVersion, projectId, applicationId],
  );

  const { newPath, search } = useReplaceVersionInPath(versions, versionId);

  const handleDeleteSuccess = useCallback(
    () => {
      navigate(
        {
          pathname: encodeURI(newPath),
          search,
        },
        {
          state,
          replace: true,
        });
      resetDeleteVersion();
    },
    [navigate, newPath, resetDeleteVersion, search, state]
  );

  useEffect(() => {
    if (isDeleteVersionError) {
      toastError(buildErrorMessage(deleteVersionError));
      resetDeleteVersion();
    } else if (isDeleteVersionSuccess) {
      toastInfo('Version has been deleted!');
      handleDeleteSuccess()
    }
  }, [isDeleteVersionSuccess, isDeleteVersionError, deleteVersionError, toastError, toastInfo, resetDeleteVersion, handleDeleteSuccess]);


  return {
    doDeleteVersion,
    isDeletingVersion,
    resetDeleteVersion,
    isDeleteVersionError,
    isDeleteVersionSuccess
  };
}

export default useDeleteVersion;