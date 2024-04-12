import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import NormalRoundButton from '@/components/NormalRoundButton';
import { useCallback, useState } from 'react';
import useToast from '@/components/useToast';
import InputVersionDialog from '@/pages/Prompts/Components/Form/InputVersionDialog';
import useSaveNewVersion from './useSaveNewVersion';


export default function SaveNewVersionButton({
  versions,
  applicationId,
  getFormValues,
  disabled
}) {
  const [showInputVersion, setShowInputVersion] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  const onSaveVersion = useCallback(
    () => {
      if (!showInputVersion) {
        setShowInputVersion(true);
      }
    },
    [showInputVersion],
  );

  const onCancelShowInputVersion = useCallback(
    () => {
      setShowInputVersion(false);
      setNewVersion('');
    },
    [],
  );

  const onCloseToast = useCallback(
    () => {
      
    },
    [],
  )

  const { ToastComponent: Toast, toastError, toastSuccess } = useToast({ onCloseToast });
  const { version_details } = getFormValues();

  const {
    onCreateNewVersion,
    isSavingNewVersion,
  } = useSaveNewVersion({toastError, toastSuccess, applicationId, versionDetails: {
      ...version_details,
      id: undefined
    }});

  const handleSaveVersion = useCallback(
    () => {
      const foundNameInTheList = versions.find(item => item.name === newVersion);
      if (!foundNameInTheList && newVersion) {
        onCreateNewVersion(newVersion);
      } else {
        toastError(newVersion
          ?
          'The version name has already existed, please choose a new name!'
          :
          'Empty version name is not allowed!');
      }
    },
    [newVersion, onCreateNewVersion, toastError, versions],
  );

  const onConfirmVersion = useCallback(
    () => {
      setShowInputVersion(false);
      handleSaveVersion();
    },
    [handleSaveVersion],
  );

  const onInputVersion = useCallback((event) => {
    const { target } = event;
    event.stopPropagation();
    setNewVersion(target?.value.trim());
  }, []);

  return <>
    <NormalRoundButton
      disabled={isSavingNewVersion || showInputVersion || disabled}
      variant='contained'
      color='secondary'
      onClick={onSaveVersion}
    >
      Save As Version
      {isSavingNewVersion && <StyledCircleProgress size={20} />}
    </NormalRoundButton>
    <InputVersionDialog
      open={showInputVersion}
      showTips={false}
      disabled={!newVersion}
      title={'Create version'}
      doButtonTitle={'Save'}
      versionName={newVersion}
      disabledInput={false}
      onCancel={onCancelShowInputVersion}
      onConfirm={onConfirmVersion}
      onChange={onInputVersion}
    />
    <Toast />
  </>
}