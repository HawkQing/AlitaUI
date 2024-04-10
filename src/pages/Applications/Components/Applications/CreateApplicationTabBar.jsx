import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import {
  useNavBlocker,
} from '@/pages/hooks';
import { useNavigate } from 'react-router-dom';
import DiscardButton from './DiscardButton';
import { useMemo, useCallback, useState, useEffect } from 'react';
import useCreateApplication from './useCreateApplication';
import { useFormikContext } from 'formik';
import { SaveButton } from '@/pages/Prompts/Components/Common';

const TabBarItems = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'reverse-row',
}));

export default function CreateApplicationTabBar({isEditingTool}) {
  const formik = useFormikContext();
  const [wantToCancel, setWantToCancel] = useState(false)
  const navigate = useNavigate();
  const {
    isLoading,
    create,
  } = useCreateApplication(formik);

  const shouldDisableSave = useMemo(() => isLoading ||
    !formik.values.name ||
    !formik.values.description ||
    !formik.dirty ||
    isEditingTool,
    [formik.dirty, formik.values.description, formik.values.name, isLoading, isEditingTool])

  const blockOptions = useMemo(() => {
    return {
      blockCondition: !!formik?.dirty && !wantToCancel
    }
  }, [formik?.dirty, wantToCancel]);
  useNavBlocker(blockOptions);

  const onCancel = useCallback(
    () => {
      setWantToCancel(true);
    },
    [],
  );

  useEffect(() => {
   if (wantToCancel) {
    navigate(-1)
  }
  }, [navigate, wantToCancel])
  

  return <>
    <TabBarItems>
      <SaveButton
        disabled={shouldDisableSave}
        variant="contained"
        onClick={create}>
        Save
        {isLoading && <StyledCircleProgress size={20} />}
      </SaveButton>
      <DiscardButton
        title={'Cancel'}
        disabled={isLoading || !formik.dirty || isEditingTool}
        onDiscard={onCancel}
      />
    </TabBarItems>
  </>
}