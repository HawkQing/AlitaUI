import React, { useCallback, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableSortLabel from '@mui/material/TableSortLabel';

import styled from "@emotion/styled";
import { useTheme } from '@emotion/react';
import Typography from '@mui/material/Typography';
import { useTokenListQuery, useTokenDeleteMutation } from '@/api/auth';
import { useSelector } from 'react-redux';
import { calculateExpiryInDays, stableSort } from '@/common/utils';
import SuccessIcon from '@/components/Icons/SuccessIcon';
import AttentionIcon from '@/components/Icons/AttentionIcon';
import RemoveIcon from '@/components/Icons/RemoveIcon';
import DeleteIcon from '@/components/Icons/DeleteIcon';
import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import AlertDialog from '@/components/AlertDialog';
import Skeleton from '@mui/material/Skeleton';
import { SortOrderOptions } from '@/common/constants';
import SortUpwardIcon from '@/components/Icons/SortUpwardIcon';
import SortDisabledIcon from '@/components/Icons/SortDisabledIcon';

const StyledTableHeadCell = styled(TableCell)(({ theme }) => `
  padding: 6px 16px;
  border-bottom: 1px solid ${theme.palette.border.table};  
  height: 30px;
  width: 33.33%;
`)

const StyledTableBodyCell = styled(TableCell)(({ theme }) => `
  padding: 6px 16px;
  height: 52px;
  border-bottom: 1px solid ${theme.palette.border.table};  
  color: ${theme.palette.text.secondary};
  width: 33.33%;
`)

const ExpiryInDays = ({ expires }) => {
  const theme = useTheme();
  const expiryInDays = calculateExpiryInDays(expires);
  if (expiryInDays > 7) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
        <SuccessIcon width='16px' height='16px' fill={theme.palette.status.published} />
        <Typography sx={{ marginLeft: '8px' }} color='text.secondary' variant='bodySmall'>
          {`in ${expiryInDays} days`}
        </Typography>
      </Box>
    )
  } else if (expiryInDays > 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
        <AttentionIcon width='16px' height='16px' fill={theme.palette.status.onModeration} />
        <Typography sx={{ marginLeft: '8px' }} color='text.secondary' variant='bodySmall'>
          {`in ${expiryInDays} days`}
        </Typography>
      </Box>
    )
  } else if (expiryInDays === -1) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
        <SuccessIcon width='16px' height='16px' fill={theme.palette.status.published} />
        <Typography sx={{ marginLeft: '8px', lineHeight: '100%' }} color='text.primary' variant='bodySmall'>
          Never
        </Typography>
      </Box>
    )
  } else { 
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%' }}>
        <RemoveIcon width='16px' height='16px' fill={theme.palette.icon.fill.disabled} />
        <Typography sx={{ marginLeft: '8px', lineHeight: '100%' }} color='text.primary' variant='bodySmall'>
          Expired
        </Typography>
      </Box>
    )
  }
}

const TokenRow = ({ token, deleteToken, refetch }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const onClickDelete = useCallback(
    () => {
      setOpenAlert(true);
    },
    [],
  )

  const onCloseAlert = useCallback(
    () => {
      setOpenAlert(false);
    },
    [],
  );
  const onConfirmAlert = useCallback(
    async () => {
      onCloseAlert();
      if (!isDeleting) {
        setIsDeleting(true);
        const { error } = await deleteToken({ uuid: token.uuid })
        if (!error) {
          await refetch();
        }
        setIsDeleting(false);
      }
    }, [deleteToken, isDeleting, onCloseAlert, refetch, token.uuid]);

  return (
    <TableRow key={token.id}>
      <StyledTableBodyCell sx={{padding: '6px 16px 6px 20px !important'}} align="left" colSpan={3}>
        <Typography variant='bodyMedium'>
          {token.name}
        </Typography>
      </StyledTableBodyCell>
      <StyledTableBodyCell align="left" colSpan={3}>
        <Typography variant='bodyMedium'>
          {'...' + token.token.substring(token.token.length - 4)}
        </Typography>
      </StyledTableBodyCell>
      <StyledTableBodyCell align="left" colSpan={3}>
        <ExpiryInDays expires={token.expires} />
      </StyledTableBodyCell>
      <StyledTableBodyCell align="right" colSpan={3}>
        <Box sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onClick={onClickDelete}>
          <DeleteIcon sx={{ fontSize: '16px' }} />
          {
            isDeleting && <StyledCircleProgress size={16} />
          }
        </Box>
        <AlertDialog
          title={'Delete personal token'}
          alertContent={"The deleted token can't be restored, are you sure to delete it?"}
          open={openAlert}
          onClose={onCloseAlert}
          onCancel={onCloseAlert}
          onConfirm={onConfirmAlert}
        />
      </StyledTableBodyCell>
    </TableRow>
  )
}

const PersonalTokenTable = () => {
  const user = useSelector(state => state.user)
  const { data: tokens = [], isFetching: isFetchingTokens, refetch } = useTokenListQuery({ skip: !user.personal_project_id })
  const [deleteToken] = useTokenDeleteMutation()
  const [orderBy, setOrderBy] = useState('')
  const [order, setOrder] = useState(SortOrderOptions.ASC);

  const sortedTokens = useMemo(() => {
    if (orderBy) {
      return stableSort(tokens, (first, second) => {
        if (typeof first[orderBy] === 'string') {
          if (order === SortOrderOptions.ASC) {
            return first[orderBy].toLowerCase().localeCompare(second[orderBy].toLowerCase());
          } else {
            return -1 * first[orderBy].toLowerCase().localeCompare(second[orderBy].toLowerCase());
          } 
        } else {
          if (order === SortOrderOptions.ASC) {
            return first[orderBy] - second[orderBy];
          } else {
            return -1 * first[orderBy] - second[orderBy];
          } 
        }
      })
    } else {
      return tokens;
    }
  }, [order, orderBy, tokens]);

  const onClickSortLabel = useCallback(
    (fieldName) => () => {
      if (fieldName !== orderBy) {
        setOrderBy(fieldName);
        setOrder(SortOrderOptions.ASC);
      } else {
        if (order === SortOrderOptions.ASC) {
          setOrder(SortOrderOptions.DESC);
        } else {
          setOrder(SortOrderOptions.ASC);
        }
      }
    },
    [order, orderBy],
  );

  return !isFetchingTokens ? (
    <TableContainer sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="personal tokens table">
        <TableHead>
          <TableRow>
            <StyledTableHeadCell align="left" colSpan={3}>
              <TableSortLabel
                active={true}
                direction={orderBy === 'name' ? order : SortOrderOptions.DESC}
                onClick={onClickSortLabel('name')}
                IconComponent={orderBy === 'name' ? SortUpwardIcon : SortDisabledIcon}
                style={{ flexDirection: 'row-reverse' }}
              >
                <Typography variant='labelSmall'>Name</Typography>
              </TableSortLabel>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="left" colSpan={3}>
              <Typography variant='labelSmall'>
                Token value
              </Typography>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="left" colSpan={3}>
              <TableSortLabel
                active={true}
                direction={orderBy === 'expires' ? order : SortOrderOptions.DESC}
                onClick={onClickSortLabel('expires')}
                IconComponent={orderBy === 'expires' ? SortUpwardIcon : SortDisabledIcon}
                style={{ flexDirection: 'row-reverse' }}
              >
                <Typography variant='labelSmall'>Expiration</Typography>
              </TableSortLabel>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="left" colSpan={3}>

            </StyledTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            sortedTokens.map((token) => {
              return (
                <TokenRow key={token.id} token={token} deleteToken={deleteToken} refetch={refetch} />
              );
            })
          }
        </TableBody>
      </Table>

    </TableContainer>
  ) :
    (
      <Box marginLeft={'20px'}>
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
        <Skeleton sx={{ marginBottom: '8px' }} variant="rectangular" width={'100%'} height={40} />
      </Box>
    );
}

export default PersonalTokenTable;
