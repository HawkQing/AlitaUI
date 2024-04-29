import { ChatParticipantType } from '@/common/constants';
import ApplicationsIcon from '@/components/Icons/ApplicationsIcon';
import ConsoleIcon from '@/components/Icons/ConsoleIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import EmojiIcon from '@/components/Icons/EmojiIcon';
import ModelIcon from '@/components/Icons/ModelIcon';
import SettingIcon from '@/components/Icons/SettingIcon';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import DeleteParticipantButton from './DeleteParticipantButton';
import { useLazyGetPromptQuery } from '@/api/prompts';
import { useLazyApplicationDetailsQuery } from '@/api/applications';
import { useLazyDatasourceDetailsQuery } from '@/api/datasources';
import { useSelectedProjectId } from '@/pages/hooks';
import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';

export const getIcon = (type, isActive, theme, showBigIcon = false) => {
  switch (type) {
    case ChatParticipantType.Prompts:
      return <ConsoleIcon fontSize={showBigIcon ? '24px' : '16px'} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    case ChatParticipantType.Datasources:
      return <DatabaseIcon fontSize={showBigIcon ? '24px' : '16px'} sx={{ color: isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default }} />
    case ChatParticipantType.Applications:
      return <ApplicationsIcon sx={{ color: isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default, fontSize: showBigIcon ? 24 : 16 }} />
    case ChatParticipantType.Models:
      return <ModelIcon width={showBigIcon ? 24 : 16} height={showBigIcon ? 24 : 16} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} />
    default:
      return <EmojiIcon width={showBigIcon ? 24 : 16} height={showBigIcon ? 24 : 16} fill={isActive ? theme.palette.icon.fill.tips : theme.palette.icon.fill.default} fontSize={showBigIcon ? '24px' : '16px'} />
  }
}

const ParticipantItem = ({ participant = {}, collapsed, isActive, onClickItem, onShowSettings, onDelete, onUpdateParticipant }) => {
  const { id, type, name, model_name, shouldUpdateDetail } = participant
  const projectId = useSelectedProjectId()
  const [getPromptDetail, { isFetching: isFetchingPrompt }] = useLazyGetPromptQuery()
  const [getApplicationDetail, { isFetching: isFetchingApplication }] = useLazyApplicationDetailsQuery()
  const [getDatasourceDetail, { isFetching: isFetchingDatasource }] = useLazyDatasourceDetailsQuery()
  const isFetching = useMemo(() => isFetchingPrompt || isFetchingApplication || isFetchingDatasource, [isFetchingApplication, isFetchingDatasource, isFetchingPrompt])
  const theme = useTheme();
  const onClickSettings = useCallback(
    (event) => {
      event.stopPropagation();
      onShowSettings(participant);
    },
    [onShowSettings, participant],
  )
  const onClickHandler = useCallback(
    () => {
      onClickItem(isActive ? undefined : participant);
    },
    [isActive, onClickItem, participant],
  )

  const getDetails = useCallback(
    async () => {
      switch (type) {
        case ChatParticipantType.Prompts:
          {
            const result = await getPromptDetail({ projectId, promptId: id })
            const promptDetail = result?.data || {};
            onUpdateParticipant({
              ...participant,
              shouldUpdateDetail: undefined,
              version_id: promptDetail.version_details.id,
              version_details: promptDetail.version_details,
              versions: promptDetail.versions
            })
          }
          break;
        case ChatParticipantType.Applications:
          {
            const result = await getApplicationDetail({ projectId, applicationId: id })
            const applicationDetail = result?.data || {};
            onUpdateParticipant({
              ...participant,
              shouldUpdateDetail: undefined,
              version_id: applicationDetail.version_details.id,
              version_details: applicationDetail.version_details,
              versions: applicationDetail.versions
            })
          }
          break;
        case ChatParticipantType.Datasources:
          {
            const result = await getDatasourceDetail({ projectId, datasourceId: id })
            const datasourceDetail = result?.data || {};
            onUpdateParticipant({
              ...participant,
              shouldUpdateDetail: undefined,
              description: datasourceDetail.description,
              version_id: datasourceDetail.version_details.id,
              version_details: datasourceDetail.version_details,
              versions: datasourceDetail.versions
            })
          }
          break;
        default:
          break;
      }
    },
    [
      type,
      getPromptDetail,
      projectId,
      id,
      onUpdateParticipant,
      participant,
      getApplicationDetail,
      getDatasourceDetail],
  )

  useEffect(() => {
    if (shouldUpdateDetail) {
      getDetails()
    }
  }, [getDetails, shouldUpdateDetail])

  return (
    <Tooltip title={participant.name || participant.model_name} placement="top">
      <Box
        onClick={onClickHandler}
        sx={{
          cursor: 'pointer',
          padding: collapsed ? '0 0' : '8px 16px',
          borderRadius: '8px',
          gap: '12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
          height: '40px',
          boxSizing: 'border-box',
          background: isActive ? theme.palette.split.pressed : theme.palette.background.secondary,
          border: isActive ? `1px solid ${theme.palette.split.hover}` : undefined,
          ':hover': {
            background: theme.palette.border.table,
          },
          '&:hover #SettingButton': {
            visibility: 'visible',
          },
          '&:hover #DeleteButton': {
            visibility: 'visible',
          },
        }}
      >
        <Box sx={{ width: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {
            getIcon(type, isActive, theme)
          }
        </Box>
        {!collapsed &&
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Typography variant='bodyMedium' color='text.secondary'>
              {
                name || model_name || 'Participant Name'
              }
            </Typography>
            {
              isFetching &&
              <Box sx={{ position: 'relative', height: '40px', width: '40px' }}>
                <StyledCircleProgress sx={{top: '10px', left: '5px'}} size={18}/>
              </Box>
            }
          </Box>
        }
        {
          !collapsed &&
          <DeleteParticipantButton
            id='DeleteButton'
            sx={{
              visibility: 'hidden',
              flex: undefined,
            }}
            participant={participant}
            onDelete={onDelete}
          />

        }
        {!collapsed && <Box
          id='SettingButton'
          sx={{
            width: '24px',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            visibility: 'hidden',
          }}
          onClick={onClickSettings}
        >
          <SettingIcon fill={theme.palette.icon.fill.default} fontSize={'16pz'} />
        </Box>}
      </Box>
    </Tooltip>
  )
}

export default ParticipantItem