import { Box } from '@mui/material';
import { useCallback, useState } from 'react';
import DeleteIcon from '@/components/Icons/DeleteIcon';
import AlertDialog from '@/components/AlertDialog';

const DeleteParticipantButton = ({ participant, onDelete, sx }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const onClickDelete = useCallback(
    (event) => {
      event.stopPropagation();
      setOpenAlert(true);
    },
    [],
  )

  const onCloseAlert = useCallback(
    () => {
      setOpenAlert(false);
    },
    [],
  )

  const onConfirmAlert = useCallback(
    () => {
      onDelete(participant.id);
      setOpenAlert(false);
    },
    [onDelete, participant.id],
  )

  return (
    <>
      <Box
        onClick={onClickDelete}
        id='DeleteButton'
        sx={{
          flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
          ...sx,
        }}
      >
        <DeleteIcon fontSize='16px' />
      </Box>
      <AlertDialog
        title={'Warning'}
        alertContent={`Are you sure to remove this participant ${participant.name || participant.model_name} from the conversation?`}
        open={openAlert}
        onClose={onCloseAlert}
        onCancel={onCloseAlert}
        onConfirm={onConfirmAlert}
      />
    </>
  )
}

export default DeleteParticipantButton