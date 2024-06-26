import { buildErrorMessage, deduplicateVersionByAuthor } from '@/common/utils';
import AlertDialog from '@/components/AlertDialog';
import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import IconButton from '@/components/IconButton';
import DeleteIcon from '@/components/Icons/DeleteIcon';
import Tooltip from '@/components/Tooltip';
import { useFromMyLibrary, useNavBlocker, useProjectId, useViewMode } from '@/pages/hooks';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ViewMode } from '@/common/constants';
import HeaderContainer from '@/components/HeaderContainer';
import { useDeleteApplicationMutation } from '@/api/applications';
import useToast from '@/components/useToast';
import { VersionAuthorAvatar } from '@/components/VersionAuthorAvatar';
import { useNavigateToAuthorPublicPage } from '@/components/useCardNavigate';
import { HeaderItemDivider, LongIconButton } from '@/pages/Prompts/Components/EditModeToolBar';
import { useLikeDataSourceCard } from '@/components/useCardLike';
import StarActiveIcon from '@/components/Icons/StarActiveIcon';
import StarIcon from '@/components/Icons/StarIcon';
import { Typography } from '@mui/material';
import BookmarkIcon from '@/components/Icons/BookmarkIcon';
import AddToCollectionDialog from '@/pages/Prompts/Components/AddToCollectionDialog';

const ADD_TO_COLLECTION_API_IS_READY = false

export default function ApplicationDetailToolbar({ name, versions, id, owner_id, is_liked, likes }) {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Warning');
  const [alertContent, setAlertContent] = useState('');
  const viewMode = useViewMode();
  const projectId = useProjectId();
  const { applicationId, } = useParams();
  const navigate = useNavigate();
  const [deleteApplication, { isLoading, error, isError, isSuccess, reset }] = useDeleteApplicationMutation();
  const isFromMyLibrary = useFromMyLibrary();
  const canDelete = useMemo(() => viewMode === ViewMode.Owner && isFromMyLibrary, [isFromMyLibrary, viewMode]);
  const { handleLikeApplicationClick, isLoading: isLiking } = useLikeDataSourceCard(id, is_liked, viewMode);
  const { setBlockNav } = useNavBlocker();
  const onCloseToast = useCallback(() => {
    if (isError) {
      reset();
    } else if (isSuccess) {
      setBlockNav(false);
      navigate(-1);
    }
  }, [isError, isSuccess, navigate, reset, setBlockNav]);

  const { ToastComponent: Toast, toastInfo, toastError } = useToast({ onCloseToast });

  const [openDialog, setOpenDialog] = useState(false);
  const onBookMark = useCallback(() => {
    setOpenDialog(true);
  }, [setOpenDialog]);

  const onDelete = useCallback(() => {
    setOpenAlert(true);
    setAlertTitle('Delete application');
    setAlertContent(`Are you sure to delete ${name}?`);
  }, [name]);

  const onCloseAlert = useCallback(
    () => {
      setOpenAlert(false);
    },
    [],
  );

  const onConfirmAlert = useCallback(
    async () => {
      onCloseAlert();
      await deleteApplication({ projectId, applicationId });
    },
    [deleteApplication, onCloseAlert, projectId, applicationId],
  );

  const { navigateToAuthorPublicPage } = useNavigateToAuthorPublicPage();

  useEffect(() => {

  }, [isSuccess, navigate]);

  useEffect(() => {
    if (isError) {
      toastError(buildErrorMessage(error));
      reset();
    } else if (isSuccess) {
      toastInfo('Delete the application successfully');
    }
  }, [error, isError, isSuccess, reset, toastError, toastInfo]);

  const {
    fetchCollectionParams,
    disableFetchingCollectionCondition,
    patchBody,
    fieldForAlreadyAdded } = useMemo(() => {
      return {
        fetchCollectionParams: {
          application_id: id,
          application_owner_id: owner_id,
        },
        disableFetchingCollectionCondition: false,
        patchBody: {
          application: {
            id,
            owner_id,
          }
        },
        fieldForAlreadyAdded: 'includes_application'
      }
    }, [id, owner_id])

  return <>
    <HeaderContainer >
      {
        viewMode === ViewMode.Public && deduplicateVersionByAuthor(versions).map((versionInfo = '') => {
          const [author, avatar, authorId] = versionInfo.split('|');
          return (
            <Tooltip key={versionInfo} title={author} placement='top'>
              <div style={{ marginLeft: '0.5rem', cursor: 'pointer' }}>
                <VersionAuthorAvatar
                  onClick={navigateToAuthorPublicPage(authorId, author)}
                  name={author}
                  avatar={avatar}
                  size={28}
                />
              </div>
            </Tooltip>
          )
        })
      }
      {viewMode === ViewMode.Public && <HeaderItemDivider />}
      {canDelete &&
        <Tooltip title='Delete application' placement='top'>
          <IconButton
            aria-label='delete data source'
            onClick={onDelete}
            disabled={isLoading}
          >
            <DeleteIcon sx={{ fontSize: '1rem' }} fill='white' />
            {isLoading && <StyledCircleProgress size={16} />}
          </IconButton>
        </Tooltip>
      }
      {ADD_TO_COLLECTION_API_IS_READY &&
        <Tooltip title="Add to collection" placement="top">
          <IconButton
            aria-label='Add to collection'
            onClick={onBookMark}
          >
            <BookmarkIcon sx={{ fontSize: '1rem' }} fill='white' />
          </IconButton>
        </Tooltip>
      }
      {viewMode === ViewMode.Public &&
        <LongIconButton
          aria-label='Add to collection'
          disabled={isLiking}
          onClick={handleLikeApplicationClick}
        >
          {is_liked ? (
            <StarActiveIcon size={'16px'} />
          ) : (
            <StarIcon className={'icon-size'} />
          )}
          <Typography sx={{ color: 'text.primary' }} variant='labelSmall'>
            {
              likes
            }
          </Typography>
          {isLiking && <StyledCircleProgress size={20} />}
        </LongIconButton>}
    </HeaderContainer>
    <AddToCollectionDialog
      open={openDialog}
      setOpen={setOpenDialog}
      fetchCollectionParams={fetchCollectionParams}
      disableFetchingCollectionCondition={disableFetchingCollectionCondition}
      patchBody={patchBody}
      fieldForAlreadyAdded={fieldForAlreadyAdded}
    />
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
