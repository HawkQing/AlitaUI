import AlertDialogV2 from "@/components/AlertDialogV2";
import DotsMenuIcon from "@/components/Icons/DotsMenuIcon";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState, useMemo, useCallback } from "react";


const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  width: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 40px 8px 20px',
  '& .MuiTypography-root': {
    color: theme.palette.text.secondary
  }
}));

const BasicMenuItem = ({ icon, label, onClick, disabled, subMenuItems, onCloseSubMenu }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const onClickMenu = useCallback((event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const withClose = useCallback((onClickSub) =>
    () => {
      if (onClickSub) {
        onClickSub();
      }
      handleClose();
      onCloseSubMenu();
    }, [handleClose, onCloseSubMenu]);

  return <>
    <StyledMenuItem
      onClick={subMenuItems?.length ? onClickMenu : onClick}
      disabled={disabled}>
      {icon}
      <Typography variant='labelMedium'>{label}</Typography>
    </StyledMenuItem>
    {
      subMenuItems?.length &&
      <Menu
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handleClose}
      >
        {subMenuItems.map((subMenuItem) => {
          const subCommonProps = {
            key: subMenuItem.label,
            label: subMenuItem.label,
            icon: subMenuItem.icon,
            disabled: subMenuItem.disabled
          }
          return subMenuItem.confirmText ?
            <ActionWithDialog
              {...subCommonProps}
              alertTitle={subMenuItem.alertTitle}
              confirmText={subMenuItem.confirmText}
              confirmButtonTitle={subMenuItem.confirmButtonTitle}
              confirmButtonSX={subMenuItem.confirmButtonSX}
              onConfirm={withClose(subMenuItem.onConfirm)}
              closeMenu={handleClose}
            /> :
            <BasicMenuItem
              {...subCommonProps}
              onClick={withClose(subMenuItem.onClick)}
            />
        })}
      </Menu>
    }
  </>
};

const ActionWithDialog = ({ icon, label, confirmText, alertTitle = 'Warning', onConfirm, closeMenu, disabled, confirmButtonTitle, confirmButtonSX }) => {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => {
    closeMenu();
    setOpen(true);
  }, [closeMenu]);
  return <>
    <BasicMenuItem icon={icon} label={label} onClick={openDialog} disabled={disabled} />
    <AlertDialogV2
      open={open}
      setOpen={setOpen}
      title={alertTitle}
      confirmButtonSX={confirmButtonSX}
      confirmButtonTitle={confirmButtonTitle}
      content={confirmText}
      onConfirm={onConfirm}
    />
  </>
};

export default function DotMenu({ id, menuIcon, menuIconSX, children, onClose, onShowMenuList, anchorOrigin, transformOrigin }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const onClickMenu = useCallback(
    (event) => {
      event.stopPropagation();
    },
    [],
  )
  
  const handleClick = useCallback((event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    if (onShowMenuList) {
      onShowMenuList();
    }
  }, [onShowMenuList]);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
    if (onClose) {
      onClose
    }
  }, [onClose]);

  const withClose = useCallback((onClickSub) =>
    () => {
      onClickSub();
      handleClose();
    }, [handleClose]);

  return (
    <Box onClick={onClickMenu}>
      <IconButton
        id={id + '-action'}
        aria-label="more"
        aria-controls={open ? 'action-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={menuIconSX}
      >
        {menuIcon || <DotsMenuIcon />}
      </IconButton>
      <Menu
        id={id + '-dots-menu'}
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'action-button',
        }}
        keepMounted
      >
        {children.map((item) => {
          const commonProps = {
            key: item.label,
            label: item.label,
            icon: item.icon,
            disabled: item.disabled,
            subMenuItems: item.subMenuItems,
          }
          return item.confirmText ?
            <ActionWithDialog
              {...commonProps}
              alertTitle={item.alertTitle}
              confirmText={item.confirmText}
              confirmButtonTitle={item.confirmButtonTitle}
              confirmButtonSX={item.confirmButtonSX}
              onConfirm={withClose(item.onConfirm)}
              closeMenu={handleClose}
            /> :
            <BasicMenuItem
              {...commonProps}
              onClick={withClose(item.onClick)}
              onCloseSubMenu={handleClose}
            />
        })}
      </Menu>
    </Box>
  )
}