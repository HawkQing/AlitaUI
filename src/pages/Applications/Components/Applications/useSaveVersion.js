import { useApplicationEditMutation } from '@/api/applications';
import { useCallback } from 'react';
import useChangeName from './useChangeName';

const useSaveVersion = ({
  projectId,
  getFormValues,
}) => {
  const handleChangeName = useChangeName();
  const [saveFn, { isError: isSaveError, isSuccess: isSaveSuccess, error: saveError, isLoading: isSaving, reset: resetSave }] = useApplicationEditMutation();

  const onSave = useCallback(
    async () => {
      const {id, version_details, name, description } = getFormValues();
      await saveFn({
        name,
        description,
        id,
        projectId,
        version:
        {
          ...version_details,
        }
      });
      handleChangeName(name)
    },
    [getFormValues, saveFn, projectId, handleChangeName],
  )



  return { onSave, isSaveError, isSaveSuccess, saveError, isSaving, resetSave }
}

export default useSaveVersion;