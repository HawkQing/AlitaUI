import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import {
  useNavBlocker,
  useSelectedProjectId,
} from '@/pages/hooks';

import NormalRoundButton from '@/components/NormalRoundButton';
import DiscardButton from './DiscardButton';
import { PUBLIC_PROJECT_ID, PromptStatus } from '@/common/constants';
import { useMemo, useCallback, useEffect } from 'react';
import usePublishVersion from './usePublishVersion';
import useToast from '@/components/useToast';
import { buildErrorMessage } from '@/common/utils';
import useSaveVersion from './useSaveVersion';
import useUnpublishVersion from './useUnpublishVersion';
import VersionSelect from './VersionSelect';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SaveNewVersionButton from './SaveNewVersionButton';
import DeleteVersionButton from './DeleteVersionButton';

const TabBarItems = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'reverse-row',
}));

export default function EditApplicationTabBar({
  getFormValues,
  isFormDirty,
  onSuccess,
  onDiscard,
  versionStatus,
  applicationId,
  isEditingTool,
  versions,
  versionIdFromDetail,
  versionDetails,
}) {
  const projectId = useSelectedProjectId();
  const { personal_project_id } = useSelector(state => state.user);
  const canPublish = useMemo(() => projectId == PUBLIC_PROJECT_ID && versionStatus === PromptStatus.Draft && false, [projectId, versionStatus])
  const canUnpublish = useMemo(() => projectId == PUBLIC_PROJECT_ID && versionStatus === PromptStatus.Published && false, [projectId, versionStatus])
  const { versionId } = useParams();
  const currentVersionId = useMemo(() => versionId || versionIdFromDetail, [versionId, versionIdFromDetail]);
  const latestVersionId = useMemo(() => (versions?.find(version => version.name === 'latest'))?.id, [versions]);
  const { onSave, isSaveError, isSaveSuccess, saveError, isSaving, resetSave } = useSaveVersion({
    projectId,
    getFormValues,
  })
  const {
    onPublish,
    isPublishingVersion,
    isPublishError,
    isPublishSuccess,
    publishError,
    resetPublish
  } = usePublishVersion(projectId, applicationId)
  const {
    onUnpublish,
    isUnpublishingVersion,
    isUnpublishError,
    isUnpublishSuccess,
    unpublishError,
    resetUnpublish
  } = useUnpublishVersion(projectId, applicationId);
  const blockOptions = useMemo(() => {
    return {
      blockCondition: !!isFormDirty
    }
  }, [isFormDirty]);
  useNavBlocker(blockOptions);

  const onCloseToast = useCallback(
    () => {
      if (isSaveSuccess) {
        onSuccess();
        resetSave();
      } else if (isSaveError) {
        resetSave();
      } else if (isPublishSuccess) {
        onSuccess();
        resetPublish();
      } else if (isPublishError) {
        resetPublish();
      } else if (isUnpublishSuccess) {
        onSuccess();
        resetUnpublish();
      } else if (isUnpublishError) {
        resetUnpublish();
      }
    },
    [
      isPublishError,
      isPublishSuccess,
      isSaveError,
      isSaveSuccess,
      isUnpublishError,
      isUnpublishSuccess,
      onSuccess,
      resetPublish,
      resetSave,
      resetUnpublish],
  )

  const { ToastComponent: Toast, toastSuccess, toastError } = useToast({ onCloseToast });

  useEffect(() => {
    if (isSaveError) {
      toastError(buildErrorMessage(saveError));
    } else if (isPublishError) {
      toastError(buildErrorMessage(publishError));
    } else if (isUnpublishError) {
      toastError(buildErrorMessage(unpublishError));
    }
  }, [isPublishError, isSaveError, isUnpublishError, publishError, saveError, toastError, unpublishError])

  useEffect(() => {
    if (isSaveSuccess) {
      toastSuccess('The application has been updated');
    } else if (isPublishSuccess) {
      toastSuccess('The application has been published');
    } else if (isUnpublishSuccess) {
      toastSuccess('The application has been unpublished');
    }
  }, [isPublishSuccess, isSaveSuccess, isUnpublishSuccess, toastSuccess])

  return <>
    <TabBarItems>
      <VersionSelect currentVersionId={currentVersionId} versions={versions} enableVersionListAvatar={projectId != personal_project_id} />
      {
        canPublish && <NormalRoundButton
          disabled={isPublishingVersion || isPublishSuccess || isEditingTool}
          variant='contained'
          color='secondary'
          onClick={onPublish}
        >
          Publish
          {isPublishingVersion && <StyledCircleProgress size={20} />}
        </NormalRoundButton>
      }
      {
        canUnpublish &&
        <NormalRoundButton
          disabled={isUnpublishSuccess || isUnpublishingVersion || isEditingTool}
          variant='contained'
          color='secondary'
          onClick={onUnpublish}
        >
          Unpublish
          {isUnpublishingVersion && <StyledCircleProgress size={20} />}
        </NormalRoundButton>
      }
      <SaveNewVersionButton
        applicationId={applicationId}
        versions={versions}
        versionDetails={versionDetails}
        getFormValues={getFormValues}
      />
      {
        currentVersionId !== latestVersionId &&
        <DeleteVersionButton versionIdFromDetail={versionIdFromDetail} versions={versions} applicationId={applicationId} />
      }
      {
        currentVersionId === latestVersionId && <NormalRoundButton
          disabled={isSaving || isSaveSuccess || !isFormDirty || isEditingTool}
          variant="contained"
          color="secondary"
          onClick={onSave}>
          Save
          {isSaving && <StyledCircleProgress size={20} />}
        </NormalRoundButton>
      }
      <DiscardButton disabled={isSaving || !isFormDirty || isEditingTool} onDiscard={onDiscard} />
    </TabBarItems>
    <Toast />
  </>
}