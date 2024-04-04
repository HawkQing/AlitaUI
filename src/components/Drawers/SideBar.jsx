
import { MyLibraryTabs, PERMISSION_GROUPS, PromptsTabs, SearchParams, ViewMode } from '@/common/constants';
import {
  DrawerMenuItem,
  SectionHeader,
  StyledActivityContainer,
  StyledActivityItem,
  StyledActivityItemContainer,
  StyledActivityTitle,
  StyledActivityTitleContainer,
  StyledBox, StyledListItemButton, StyledListItemIcon,
  StyledMenuHeader, StyledMenuItem
} from '@/components/Drawers/common.jsx';
import { useNavBlocker } from '@/pages/hooks';
import RouteDefinitions, { PathSessionMap } from '@/routes';
import {
  Divider,
  IconButton,
  List,
  ListItemText
} from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import AlitaIcon from '../Icons/AlitaIcon';
import CloseIcon from '../Icons/CloseIcon';
import CommandIcon from '../Icons/CommandIcon';
import DatabaseIcon from '../Icons/DatabaseIcon';
import FolderIcon from '../Icons/FolderIcon';
import GearIcon from '../Icons/GearIcon';
import ModeratorIcon from '../Icons/ModeratorIcon';
import UserIcon from '../Icons/UserIcon';
import ApplicationsIcon from '../Icons/ApplicationsIcon';
import ChatIcon from '@mui/icons-material/Chat';

const SideBarBody = ({ onKeyDown, onClose }) => {
  const { pathname } = useLocation();
  const { personal_project_id: privateProjectId, publicPermissions = [] } = useSelector(state => state.user);
  const navigate = useNavigate();
  const showModerationMenu = PERMISSION_GROUPS.moderation.some(p => publicPermissions.includes(p));
  const { isBlockNav, setIsResetApiState, resetApiState } = useNavBlocker();
  
  const navigateToPage = useCallback(
    (pagePath, breadCrumb) => () => {
      if (pagePath !== pathname) {
        if (isBlockNav) {
          setIsResetApiState(true);
        } else {
          resetApiState();
        }
        navigate(pagePath, {
          state: {
            routeStack: [{
              breadCrumb,
              pagePath,
            }]
          }
        });
      }
      if (onClose) {
        onClose();
      }
    },
    [isBlockNav, navigate, onClose, pathname, resetApiState, setIsResetApiState]
  );


  const displayedMenuItems = useMemo(() => {
    const permissionsSet = new Set(publicPermissions)
    const allMenus = [
      {
        menuTitle: 'Chat',
        menuIcon: <ChatIcon fontSize="1rem" />,
        onClick: navigateToPage(`${RouteDefinitions.Chat}`, 'Chat'),
        selected: pathname.startsWith(RouteDefinitions.Chat),
      },
      {
        menuTitle: 'Prompts',
        menuIcon: <CommandIcon fontSize="1rem" />,
        onClick: navigateToPage(`${RouteDefinitions.Prompts}/${PromptsTabs[0]}`, 'Prompts'),
        selected: pathname.startsWith(RouteDefinitions.Prompts) || pathname.startsWith(RouteDefinitions.UserPublic)
      },
      {
        menuTitle: 'Datasources',
        menuIcon: <DatabaseIcon />,
        onClick: navigateToPage(RouteDefinitions.DataSources, 'DataSources'),
        selected: pathname.startsWith(RouteDefinitions.DataSources),
      },
      {
        menuTitle: 'Applications',
        menuIcon: <ApplicationsIcon />,
        onClick: navigateToPage(RouteDefinitions.Applications, 'Applications'),
        selected: pathname.startsWith(RouteDefinitions.Applications),
      },
      {
        menuTitle: 'Collections',
        menuIcon: <FolderIcon selected />,
        onClick: navigateToPage(`${RouteDefinitions.Collections}/${PromptsTabs[0]}`, 'Collections'),
        selected: pathname.startsWith(RouteDefinitions.Collections)
      },
    ]
    return allMenus.filter(i => PERMISSION_GROUPS[i.menuTitle.toLowerCase()] ? PERMISSION_GROUPS[i.menuTitle.toLowerCase()].some(p => permissionsSet.has(p)) : true)
  }, [publicPermissions, pathname, navigateToPage])


  const buildMenuItems = useCallback(({ menuIcon, menuTitle, onClick, selected, display, isPersonalSpace }) => (
    <DrawerMenuItem
      key={menuTitle}
      display={display}
      menuTitle={menuTitle}
      menuIcon={menuIcon}
      selected={selected}
      onClick={onClick}
      isPersonalSpace={isPersonalSpace}
    />
  ), [])

  const myMenuData = useMemo(() => [
    {
      menuTitle: 'My libraries',
      menuIcon: <UserIcon />,
      onClick: navigateToPage(`${RouteDefinitions.MyLibrary}/${MyLibraryTabs[0]}?${SearchParams.ViewMode}=${ViewMode.Owner}&statuses=all`, 
        PathSessionMap[RouteDefinitions.MyLibrary]),
      selected: pathname.startsWith(RouteDefinitions.MyLibrary),
      isPersonalSpace: true,
    },
  ], [pathname, navigateToPage])

  const moderationMenuData = useMemo(() => [
    {
      menuTitle: 'Moderation Space',
      menuIcon: <ModeratorIcon />,
      onClick: navigateToPage(RouteDefinitions.ModerationSpace, 'Moderation Space'),
      selected: pathname.startsWith(RouteDefinitions.ModerationSpace)
    }
  ], [pathname, navigateToPage])


  const activities = useMemo(() => [
    'Help me choose software for [task]',
    'HTML / CSS Table With CTA',
    'Plagiarism Checker Tool Development',
    'Learning [New Technology/',
    'Choose software for [task]'
  ], []);

  return (
    <StyledBox
      role="presentation"
      onKeyDown={onKeyDown}
    >
      <StyledMenuHeader>
        <IconButton
          size="large"
          color="inherit"
          aria-label="open drawer"
          sx={{ mr: 0, paddingTop: 0.8, paddingBottom: 0.8, paddingLeft: 0.8, background: 'transparent' }}
          disabled
        >
          <AlitaIcon sx={{ fontSize: 36 }} />
        </IconButton>
        <CloseIcon onClick={onClose} />
      </StyledMenuHeader>
      <Divider />
      <SectionHeader>
        <Typography>Discover</Typography>
      </SectionHeader>
      <List>
        {
          displayedMenuItems.map(buildMenuItems)
        }
      </List>
      <Divider />
      {privateProjectId &&
        <>
          <List>
            {
              myMenuData.map(buildMenuItems)
            }
          </List>
          <Divider />
        </>
      }
      {showModerationMenu &&
        <>
          <List>
            {
              moderationMenuData.map(buildMenuItems)
            }
          </List>
          <Divider />
        </>
      }
      <StyledActivityContainer sx={{ display: 'none' }}>
        <StyledActivityTitleContainer>
          <StyledActivityTitle variant="subtitle1" gutterBottom>
            Recent activity
          </StyledActivityTitle>
        </StyledActivityTitleContainer>
        <StyledActivityItemContainer>
          {
            activities.map(
              (activity, index) => (
                <StyledActivityItem
                  key={index + activity}
                  variant="body2" gutterBottom>
                  {activity}
                </StyledActivityItem>))
          }
        </StyledActivityItemContainer>
      </StyledActivityContainer>
      <StyledMenuItem sx={{ display: 'none' }}>
        <StyledListItemButton onClick={navigateToPage(RouteDefinitions.Settings, 'Settings')}>
          <StyledListItemIcon>
            <GearIcon />
          </StyledListItemIcon>
          <ListItemText primary='Quick access settings' />
        </StyledListItemButton>
      </StyledMenuItem>
    </StyledBox>
  )
};

SideBarBody.propTypes = {
  onClose: PropTypes.func,
  onKeyDown: PropTypes.func,
}

const SideBar = ({
  open,
  onClose,
  onKeyDown
}) => {
  const [showSideBar, setShowSideBar] = useState(false)

  const onCloseHandler = useCallback(
    () => {
      setShowSideBar(false);
      if (onClose) {
        onClose();
      }
    },
    [onClose],
  )

  useEffect(() => {
    setShowSideBar(open);
  }, [open])

  return (
    <Drawer
      anchor={'left'}
      open={showSideBar}
      onClose={onCloseHandler}
    >
      <SideBarBody
        onKeyDown={onKeyDown}
        onClose={onCloseHandler}
      />
    </Drawer>
  )
}

SideBar.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onKeyDown: PropTypes.func,
}

export default SideBar;