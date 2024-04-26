import ArrowRightIcon from "@/components/Icons/ArrowRightIcon";
import DatabaseIcon from "@/components/Icons/DatabaseIcon";
import DeleteIcon from "@/components/Icons/DeleteIcon";
import styled from "@emotion/styled";
import { Box, IconButton, Typography } from "@mui/material";
import { ToolTypes } from "./consts";
import FileCodeIcon from '@/components/Icons/FileCodeIcon';
import { useCallback, useState, useMemo, useEffect } from 'react'
import { buildErrorMessage, filterProps, parseCustomJsonTool } from '@/common/utils';
import JsonIcon from '@/components/Icons/JsonIcon';
import CommandIcon from "@/components/Icons/CommandIcon";
import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import { useFormikContext } from 'formik';
import { useDeleteApplicationToolMutation } from '@/api/applications';
import { useSelectedProjectId } from '@/pages/hooks';
import useToast from '@/components/useToast';
import { alitaApi } from '@/api/alitaApi';
import { useDispatch } from 'react-redux';
import AlertDialog from '@/components/AlertDialog';

const CardContainer = styled(Box)(() => ({
  borderRadius: '8px',
}));

const CardHeaderContainer = styled(Box, filterProps('showActions'))(({ theme, showActions }) => ({
  borderRadius: showActions ? '8px 8px 0 0' : '8px',
  display: 'flex',
  padding: '12px 16px',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  backgroundColor: theme.palette.background.secondary,
  '&:hover': {
    border: '1px solid ' + theme.palette.border.lines,
    padding: '11px 15px',
  }
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  marginTop: '2px',
  borderRadius: ' 0 0 8px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  backgroundColor: theme.palette.background.secondary,
}));

const ActionRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  padding: '0 36px 0 28px',
  boxSizing: 'border-box',
}));

const ToolIconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '12px',
  borderRadius: '8px',
  background: theme.palette.background.icon.default
}));


const ToolIcon = ({ type }) => {
  switch (type) {
    case ToolTypes.datasource.value:
      return <DatabaseIcon sx={{ fontSize: '1.13rem' }} />
    case ToolTypes.prompt.value:
      return <CommandIcon sx={{ fontSize: '1.13rem' }} />
    case ToolTypes.open_api.value:
      return <FileCodeIcon sx={{ fontSize: '1.13rem' }} />
    case ToolTypes.custom.value:
      return <JsonIcon sx={{ fontSize: '1.13rem' }} />
    default:
      return null
  }
};

export default function ToolCard({
  tool,
  index,
  setEditToolDetail,
  applicationId,
}) {
  const [openAlert, setOpenAlert] = useState(false);
  const { ToastComponent: Toast, toastError } = useToast();
  const dispatch = useDispatch();
  const projectId = useSelectedProjectId();
  const [showActions, setShowActions] = useState(false)
  const { setFieldValue, values } = useFormikContext();
  const tools = useMemo(() => (values?.version_details?.tools || []), [values?.version_details?.tools])
  const [deleteTool, { isLoading, isError: isDeleteError, error: deleteError, reset }] = useDeleteApplicationToolMutation();
  const parsedFunctions = useMemo(() => {
    if (tool.type === ToolTypes.custom.value) {
      return parseCustomJsonTool(tool.settings.custom_json || '');
    }
    return [];
  }, [tool.settings.custom_json, tool.type])

  const onDelete = useCallback(async () => {
    setOpenAlert(true);
  }, []);

  const onConfirmAlert = useCallback(async () => {
    setOpenAlert(false);
    if (applicationId && tool?.id) {
      const result = await deleteTool({ projectId, toolId: tool?.id })
      if (!result.error) {
        dispatch(alitaApi.util.updateQueryData('applicationDetails', { applicationId, projectId }, (details) => {
          details.version_details.tools = details.version_details.tools.filter(item => {
            return item.id !== tool.id;
          });
        }));
        setFieldValue('version_details.tools',
          tools.filter((_, i) => i !== index))
        reset();
      }
    } else {
      setFieldValue('version_details.tools',
        tools.filter((_, i) => i !== index))
    }
  }, [applicationId, deleteTool, dispatch, index, projectId, reset, setFieldValue, tool.id, tools]);

  const onCloseAlert = useCallback(
    () => {
      setOpenAlert(false);
    },
    [],
  )

  const onEditTool = useCallback(() => {
    setEditToolDetail({
      ...tools[index],
      index
    })
  }, [index, setEditToolDetail, tools]);

  const onClickShowActions = useCallback((event) => {
    event.stopPropagation();
    setShowActions(prev => !prev)
  }, [])

  useEffect(() => {
    if (isDeleteError) {
      toastError(buildErrorMessage(deleteError))
    }
  }, [deleteError, isDeleteError, toastError])

  return (
    <CardContainer>
      <CardHeaderContainer showActions={showActions}>
        <ToolIconContainer>
          <ToolIcon type={tool.type} />
        </ToolIconContainer>
        <Box
          onClick={onEditTool}
          sx={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', width: 'calc(100% - 108px)' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography
              variant='labelMedium'
              component='div'
              color='text.secondary'
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {tool.name}
            </Typography>
            <ArrowRightIcon sx={{ fontSize: '1rem' }} />
          </Box>
          {
            ((tool.type === ToolTypes.datasource.value && !tool.settings.actions?.length) ||
              tool.type === ToolTypes.prompt.value) &&
            <Typography
              component='div'
              variant='labelSmall'
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {tool.description}
            </Typography>
          }
          {
            ((tool.type === ToolTypes.open_api.value && tool.settings.actions) ||
              (tool.type === ToolTypes.datasource.value && tool.settings.actions)) &&
            <Box sx={{ cursor: 'pointer' }} onClick={onClickShowActions}>
              <Typography variant='bodySmall'>
                {showActions ? 'Hide Actions' : 'Show Actions'}
              </Typography>
            </Box>
          }
          {
            !!parsedFunctions.length &&
            <Box sx={{ cursor: 'pointer' }} onClick={onClickShowActions}>
              <Typography variant='bodySmall'>
                {showActions ? 'Hide Functions' : 'Show Functions'}
              </Typography>
            </Box>
          }
        </Box>
        <Box>
          <IconButton
            aria-label='delete tool'
            onClick={onDelete}
          >
            <DeleteIcon sx={{ fontSize: '1.13rem' }} />
            {isLoading && <StyledCircleProgress size={20} />}
          </IconButton>
        </Box>
      </CardHeaderContainer>
      {
        showActions && (tool.type === ToolTypes.open_api.value || tool.type === ToolTypes.custom.value) &&
        <ActionsContainer>
          {
            (tool.type === ToolTypes.open_api.value ? tool.settings.actions : parsedFunctions).map((item, idx) => {
              return <ActionRow key={item.name + idx}>
                <Box sx={{ width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant='bodyMedium'>
                    -
                  </Typography>
                </Box>
                <Box sx={{ width: 'calc(100% - 34px)', marginLeft: '10px', height: '46px' }}>
                  <Typography
                    color='text.secondary'
                    sx={{ height: '24px' }}
                    variant='bodyMedium'
                    component='div'>
                    {item.name}
                  </Typography>
                  <Typography
                    sx={{
                      height: '22px',
                      width: '100%',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',

                    }}
                    variant='bodySmall'
                    component='div'
                  >
                    {item.description}
                  </Typography>
                </Box>
              </ActionRow>
            })
          }
        </ActionsContainer>
      }
      {
        showActions && tool.type === ToolTypes.datasource.value &&
        <ActionsContainer>
          {
            tool.settings.actions.map((item) => {
              return (
                <ActionRow sx={{ paddingTop: '4px' }} key={item}>
                  <Box sx={{ width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant='bodyMedium'>
                      -
                    </Typography>
                  </Box>
                  <Box sx={{ width: 'calc(100% - 34px)', marginLeft: '10px', height: '32px', display: 'flex', alignItems: 'center' }}>
                    <Typography
                      color='text.secondary'
                      sx={{ height: '24px' }}
                      variant='bodyMedium'
                      component='div'>
                      {item}
                    </Typography>
                  </Box>
                </ActionRow>
              )
            })
          }
        </ActionsContainer>
      }
      <Toast />
      <AlertDialog
        title={'Warning'}
        alertContent={`Are you sure to delete tool: ${tool.name}?`}
        open={openAlert}
        onClose={onCloseAlert}
        onCancel={onCloseAlert}
        onConfirm={onConfirmAlert}
      />
    </CardContainer >
  )
}