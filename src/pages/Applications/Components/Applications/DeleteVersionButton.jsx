import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';

import NormalRoundButton from '@/components/NormalRoundButton';
import { useMemo, useCallback, useState } from 'react';
import useToast from '@/components/useToast';
import { useParams } from 'react-router-dom';
import useDeleteVersion from './useDeleteVersion';
import AlertDialog from '@/components/AlertDialog';


export default function DeleteVersionButton({
  versions,
  versionIdFromDetail,
  applicationId,
  disabled
}) {
  const { version: versionId } = useParams();
  const currentVersionId = useMemo(() => versionId || versionIdFromDetail, [versionId, versionIdFromDetail]);
  const currentVersionName = useMemo(() => (versions?.find(version => version.id === currentVersionId))?.name, [currentVersionId, versions]);


  const [openAlert, setOpenAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Warning');
  const [alertContent, setAlertContent] = useState('');

  const { ToastComponent: Toast, toastError, toastInfo } = useToast();

  const {
    doDeleteVersion,
    isDeletingVersion } =
    useDeleteVersion({ versionId: currentVersionId, applicationId, toastError, toastInfo, versions });

  const onCloseAlert = useCallback(
    () => {
      setOpenAlert(false);
    },
    [],
  );

  const onConfirmAlert = useCallback(async () => {
    onCloseAlert();
    await doDeleteVersion()
  }, [doDeleteVersion, onCloseAlert]);


  const onDeleteVersion = useCallback(
    () => {
      setOpenAlert(true);
      setAlertTitle('Delete version');
      setAlertContent(`Are you sure to delete ${currentVersionName}?`);
    }, [currentVersionName]);

  return <>
    <NormalRoundButton
      disabled={isDeletingVersion || disabled}
      variant='contained'
      color='secondary'
      onClick={onDeleteVersion}
    >
      Delete Version
      {isDeletingVersion && <StyledCircleProgress size={20} />}
    </NormalRoundButton>
    <AlertDialog
      title={alertTitle}
      alertContent={alertContent}
      open={openAlert}
      onClose={onCloseAlert}
      onCancel={onCloseAlert}
      onConfirm={onConfirmAlert}
    />
    <Toast />
  </>
}