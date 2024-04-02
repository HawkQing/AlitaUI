import { datasetStatus } from "@/pages/DataSources/constants";
import DoDisturbOnOutlinedIcon from '@mui/icons-material/DoDisturbOnOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import { useTheme } from '@emotion/react';

const ReindexIcon = ({
  doReIndex
}) => {
  return <IconButton
    aria-label="reindex"
    onClick={doReIndex}
  >
    <RefreshOutlinedIcon color='secondary' fontSize={'small'} />
  </IconButton>
}

const DowloadLogsIcon = ({
  downloadLogs
}) => {
  return <IconButton
    aria-label="download-logs"
    onClick={downloadLogs}
  >
    <SimCardDownloadOutlinedIcon color='secondary' fontSize={'small'} />
  </IconButton>
}

export default function StatusIcon({
  status,
  error = 'An error',
  doReIndex,
  downloadLogs,
}) {
  const theme = useTheme();
  const title = useMemo(() => {
    return (status === datasetStatus.error.value ? error : '') + datasetStatus[status]?.hint
  }, [error, status]);

  const statusContent = useMemo(() => {
    
    switch (status) {
      case datasetStatus.preparing.value:
      case datasetStatus.pending.value:
      case datasetStatus.running.value:
      // case datasetStatus.quota_exceeded.value:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              color: theme.palette.text.info
            }}>
            <CircularProgress color={'inherit'} size={16} />
            <Typography color={'inherit'} variant='labelSmall'>{title}</Typography>
          </Box>
        )
      case datasetStatus.stopped.value:
        return (
          <>
            <Tooltip title={title} placement='top'>
              <IconButton disableRipple>
                <DoDisturbOnOutlinedIcon color='warning' fontSize={'small'} />
              </IconButton>
            </Tooltip>
            <ReindexIcon doReIndex={doReIndex} fontSize={'small'}/>
          </>
        )
      case datasetStatus.quota_exceeded.value:
        return (
          <>
            <Tooltip title={title} placement='top'>
              <IconButton disableRipple>
                <ErrorOutlineOutlinedIcon color='error' fontSize={'small'}/>
              </IconButton>
            </Tooltip>
            <DowloadLogsIcon downloadLogs={downloadLogs} fontSize={'small'}/>
          </>
        )
      default:
        return (
          <>
            <Tooltip title={title} placement='top'>
              <IconButton disableRipple>
                <ErrorOutlineOutlinedIcon color='error' fontSize={'small'}/>
              </IconButton>
            </Tooltip>
            <DowloadLogsIcon downloadLogs={downloadLogs} fontSize={'small'}/>
            <ReindexIcon doReIndex={doReIndex} fontSize={'small'}/>
          </>
        )
    }
  }, [status, theme.palette.text.info, title, downloadLogs, doReIndex]);


  return (
    <Box display='flex' alignItems={'center'}>
      {statusContent}
    </Box>
  )
}