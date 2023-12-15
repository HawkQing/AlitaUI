import { NAV_BAR_HEIGHT, CENTERED_CONTENT_BREAKPOINT, SearchParams, PromptsTabs, MyLibraryTabs } from '@/common/constants';
import { logout } from '@/slices/user';
import isPropValid from '@emotion/is-prop-valid';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@/components/Icons/SearchIcon';
import {
  AppBar,
  Box,
  Breadcrumbs,
  Divider,
  ListItem,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import RouteDefinitions, { PathSessionMap } from '../routes';
import HeaderSplitButton from './HeaderSplitButton';
import AlitaIcon from './Icons/AlitaIcon';
import NotificationButton from './NotificationButton';
import { SearchIconWrapper, SearchPanel, StyledInputBase } from './SearchPanel.jsx';
import SideBar from './SideBar';
import UserAvatar from './UserAvatar';
import { useNameFromUrl, useViewModeFromUrl, useCollectionFromUrl } from '@/pages/hooks';

const StyledAppBar = styled(AppBar)(({theme}) => ({
    height: NAV_BAR_HEIGHT,
    overflow: 'hidden',
    position: 'fixed',
    paddingBottom: '0.5rem',
    boxShadow: 'none',
    [theme.breakpoints.up('centered_content')]: {
        maxWidth: `${CENTERED_CONTENT_BREAKPOINT}px`,
        transform: 'translateX(-50%)',
        left: '50%',
    }
}))

export const StyledPersonIcon = styled(PersonIcon)(({ theme }) => `
    fill: ${theme.palette.text.primary}
`)

const HomeButton = styled(IconButton)(() => ({
  background: 'transparent',
  padding: '0 1rem 0 0',
  '&:hover': {
    backgroundColor: 'transparent'
  }
}));

const NavActions = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleClick = useCallback(event => {
    setAnchorEl(event.currentTarget)
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleLogout = useCallback(() => {
    handleClose()
    dispatch(logout())
    navigate('/forward-auth/oidc/logout')
  }, [dispatch, handleClose, navigate])

  const handleProfile = useCallback(() => {
    handleClose()
    navigate(RouteDefinitions.Profile)
  }, [handleClose, navigate]);

  const { 
    name, 
    email, 
    avatar
  } = useSelector(state => state.user);

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
        sx={{ marginRight: 0, padding: 0 }}
      >
        <UserAvatar avatar={avatar} name={name} size={36}/>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <ListItem sx={{ justifyContent: 'center' }}>
          <Typography variant='caption'>
            {name || email}
          </Typography>
        </ListItem>
        <Divider />
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Log out</MenuItem>
      </Menu>
    </>
  )
};

const getPrevPathName = (locationState, previousState, currentPath, collection) => {
  if (locationState && locationState.from?.length) {
    const prevPath = locationState.from.slice(-1)[0];
    if (previousState && previousState.breadCrumb) {
      return previousState.breadCrumb;
    } else if (prevPath.includes(RouteDefinitions.MyLibrary)) {
      if (collection) {
        return collection;
      }
      return PathSessionMap[RouteDefinitions.MyLibrary];
    } else if (prevPath.includes(RouteDefinitions.Prompts)) {
      return PathSessionMap[RouteDefinitions.Prompts];
    }
    return PathSessionMap[prevPath];
  } else {
    if (currentPath.includes(RouteDefinitions.MyLibrary)) {
      if (collection) {
        return collection;
      }
      return PathSessionMap[RouteDefinitions.MyLibrary];
    } else if (currentPath.includes(RouteDefinitions.Prompts)) {
      return PathSessionMap[RouteDefinitions.Prompts];
    }
    return '';
  }
}

const getTabFromUrl = (url, defaultTab) => {
  const paths = url.split('/').filter(item => item.length > 0);
  const tab = paths.length > 2 ? paths[1] : defaultTab;
  return tab;
}

const getPrevPath = (locationState, currentPath, viewMode, collection) => {
  if (locationState && locationState.from?.length) {
    return locationState.from.slice(-1)[0];
  } else {
    if (currentPath.includes(RouteDefinitions.MyLibrary)) {
      if (collection) {
        return currentPath.split('/prompts')[0];
      } 
      return `${RouteDefinitions.MyLibrary}/${getTabFromUrl(currentPath, MyLibraryTabs[0])}?${SearchParams.ViewMode}=${viewMode}`;
    } else if (currentPath.includes(RouteDefinitions.Prompts)) {
      return `${RouteDefinitions.Prompts}/${getTabFromUrl(currentPath, PromptsTabs[0])}?${SearchParams.ViewMode}=${viewMode}`;
    }
    return '';
  }
}

const BreadCrumbLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  '&:hover': {
    color: 'white'
  }
}));

const isSubpathUnderMyLibraryOrPrompts = (url) => {
  const paths = url.split('/').filter(item => item.length > 0);
  return paths.length > 2;
}

const TitleBread = () => {
  const { pathname, state: locationState } = useLocation();
  const name = useNameFromUrl();
  const viewMode = useViewModeFromUrl(pathname.includes('/create'));
  const collection = useCollectionFromUrl();
  const { from, breadCrumb = '', previousState } = locationState ?? {};
  const hasHistory = useMemo(() => {
    if (locationState && from?.length) {
      return true;
    } else {
      if (pathname.startsWith(RouteDefinitions.MyLibrary)) {
        return isSubpathUnderMyLibraryOrPrompts(pathname);
      } else if (pathname.startsWith(RouteDefinitions.Prompts)) {
        return isSubpathUnderMyLibraryOrPrompts(pathname);
      }
      return false;
    }
  }, [from, locationState, pathname]);

  const isCreating = useMemo(() => pathname.startsWith(RouteDefinitions.CreateCollection) ||
    pathname.startsWith(RouteDefinitions.CreatePrompt), [pathname]);

  const breadCrumbString = useMemo(() => {
    if (breadCrumb) {
      return breadCrumb;
    } else if (name) {
      return name;
    }
    const result = PathSessionMap[pathname];
    if (result) {
      return result;
    } else if (pathname.startsWith(RouteDefinitions.MyLibrary)) {
      if (pathname.startsWith(RouteDefinitions.CreatePrompt)) {
        return PathSessionMap[RouteDefinitions.CreatePrompt]
      } else if (pathname.startsWith(RouteDefinitions.CreateCollection)) {
        return PathSessionMap[RouteDefinitions.CreateCollection]
      } else {
        return PathSessionMap[RouteDefinitions.MyLibrary];
      }
    } else if (pathname.startsWith(RouteDefinitions.Prompts)) {
      return PathSessionMap[RouteDefinitions.Prompts];
    }
    return '';
  }, [breadCrumb, name, pathname]);

  const PrevPath = useCallback(() => {
    if (hasHistory || isCreating) {
      return (
        <BreadCrumbLink
          component={RouterLink}
          to={getPrevPath(locationState, pathname, viewMode, collection)}
          state={previousState}
          underline='hover'
        >
          {getPrevPathName(locationState, previousState, pathname, collection)}
        </BreadCrumbLink>
      );
    }
    return null;
  }, [hasHistory, isCreating, locationState, pathname, previousState, viewMode, collection]);

  const breadCrumbFontStyle = {
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  return (
    <Breadcrumbs aria-label="breadcrumb" color={'text.primary'} {...breadCrumbFontStyle}>
      {(hasHistory || isCreating) && <PrevPath />}
      <Typography
        color='white'
        sx={breadCrumbFontStyle}
      >{breadCrumbString}</Typography>
    </Breadcrumbs>
  )
}

const NameText = styled(Typography, {
  shouldForwardProp: prop => isPropValid(prop)
})(({ theme, color, width }) => `
    max-width: ${width ? width : '130px'};
    margin-left: 16px;
    margin-right: 16px;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 160%; 
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    color: ${color || theme.palette.text.primary}
`);

export const UserInfo = ({ color, width }) => {
  const { name } = useSelector(state => state.user);
  return name ? (
    <NameText color={color} width={width}>
      {name}
    </NameText>)
    : null;
}

const NavBar = () => {
  const [openSideMenu, setOpenSideMenu] = useState(false)
  const onClickIcon = useCallback(
    () => {
      setOpenSideMenu((prevState) => !prevState)
    },
    [],
  )
  const toggleDrawer = useCallback((open) => (event) => {
    if (event?.type === 'keydown' &&
      (event?.key === 'Tab' ||
        event?.key === 'Shift')) {
      return;
    }
    setOpenSideMenu(open);
  }, []);

  return (
    <StyledAppBar>
      <Toolbar variant={'regular'} sx={{ padding: '16px 24px', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeButton
            size="large"
            color="inherit"
            aria-label="open drawer"
            onClick={onClickIcon}
          >
            <AlitaIcon sx={{ fontSize: 36 }} />
          </HomeButton>
          <SideBar
            open={openSideMenu}
            anchor={'left'}
            onClose={toggleDrawer(false)}
          />
          <TitleBread />
        </Box>
        <SearchPanel>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Let’s find something amaizing!"
            inputProps={{ 'aria-label': 'search' }}
          />
        </SearchPanel>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <HeaderSplitButton />
          <NotificationButton />
          <UserInfo />
          <NavActions />
        </Box>
      </Toolbar>
    </StyledAppBar>
  )
}

export default NavBar