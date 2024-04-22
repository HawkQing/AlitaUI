import {MyLibraryTabs, PERMISSIONS, SearchParams, ViewMode} from '@/common/constants';
import { useFromMyLibrary, useSelectedProjectId } from '@/pages/hooks';
import RouteDefinitions, { PathSessionMap } from '@/routes';
import { useTheme } from '@emotion/react';
import { Button, ButtonGroup, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowDownIcon from './Icons/ArrowDownIcon';
import CheckedIcon from './Icons/CheckedIcon';
import PlusIcon from './Icons/PlusIcon';
import ImportIcon from '@/components/Icons/ImportIcon';
import { useImportPromptMutation } from '@/api/prompts';
import Toast from '@/components/Toast';
import LoadingIndicator from '@/components/LoadingIndicator';
import { buildErrorMessage } from '@/common/utils';
import { useDispatch, useSelector } from 'react-redux';
import TooltipForDisablePersonalSpace, { useDisablePersonalSpace } from './TooltipForDisablePersonalSpace';
import { actions } from '@/slices/prompts';
import ModelSelectDialog from './ModelSelectDialog';
import useModelOptions from '@/pages/DataSources/Components/Datasources/useModelOptions';

const optionsMap = {
  'Chat': 'Conversation',
  'Prompt': 'Prompt',
  'Datasource': 'Datasource',
  'Application': 'Application',
  'Collection': 'Collection',
};

const displayPermissions = {
  Chat: [PERMISSIONS.chat.create],
  Prompt: ['models.prompt_lib.prompts.create'],
  Datasource: ['models.datasources.datasources.create'],
  Application: ['models.applications.applications.create'],
  Collection: ['models.prompt_lib.collections.create'],
}

const commandPathMap = {
  'Conversation': RouteDefinitions.Chat,
  'Prompt': RouteDefinitions.CreatePrompt,
  'Datasource': RouteDefinitions.CreateDatasource,
  'Application': RouteDefinitions.CreateApplication,
  'Collection': RouteDefinitions.CreateCollection,
};
const breadCrumbMap = {
  'Conversation': 'Chat',
  'Prompt': 'New Prompt',
  'Datasource': 'New Datasource',
  'Application': 'New Application',
  'Collection': 'New Collection',
};

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => (`
    background: ${theme.palette.split.default};
    border-radius: 28px;
    margin-right: 8px;
`))

const StyledDivider = styled(Divider)(({ theme }) => (`
    background: ${theme.palette.primary.main};
    height: 16px;
    margin: 10px 0;
    opacity: 0.2;
`));

const StyledDropdownButton = styled(Button)(({ theme }) => (`
    padding-top: 10px;
    padding-bottom: 10px;
    border-right: 0px !important;
    height: 36px;

    border-radius: 28px;
    background: none;
    color: ${theme.palette.primary.main};
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    text-transform: none;

    &:hover {
      background: ${theme.palette.split.hover};
    }
    &:active {
      background: ${theme.palette.split.pressed};
    }
`));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '162px',
    borderRadius: '8px',
    marginTop: '8px',
    border: `1px solid ${theme.palette.border.lines}`,
    background: theme.palette.background.secondary,
  },
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiMenuItem-root': {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '24px',
    padding: '8px 20px 8px 40px',

    '&:hover': {
      backgroundColor: theme.palette.background.select.hover,
    },

    '&.Mui-selected': {
      backgroundColor: theme.palette.background.select.selected.default,
    },

    '&.Mui-selected:hover': {
      backgroundColor: theme.palette.background.select.selected.hover,
    },
  }
}));

const MenuSectionHeader = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',

  '& svg': {
    marginRight: '8px',
  },
}));

const MenuSectionBody = styled('div')(({ theme }) => ({
  borderBottom: `0.06rem solid ${theme.palette.border.lines}`
}));

const MenuSectionFooter = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  margin: '0.25rem 0 0.5rem',
  cursor: 'pointer',
  '& svg': {
    marginRight: '8px',
  },

  '&:hover': {
    backgroundColor: theme.palette.background.select.hover,
  }
}));

const MenuItemIcon = styled(ListItemIcon)(() => ({
  width: '0.625rem',
  height: '0.625rem',
  fontSize: '0.625rem',
  marginRight: '0.6rem',
  minWidth: '0.625rem !important',
  svg: {
    fontSize: '0.625rem'
  }
}));

const StyledMenuItemIcon = styled(MenuItemIcon)(() => ({
  justifySelf: 'flex-end',
  justifyContent: 'flex-end',
  marginRight: '0rem',
  marginLeft: '1rem',
  svg: {
    fontSize: '0.75rem'
  }
}));

const getDefaultModel = (model = {}, modelOptions) => {
  const modelsList = Object.values(modelOptions);
  const { model_name = '', integration_uid = '' } = model;
  const modelAndIntegrationExists = modelsList.find(models => models.find(m => m.group === integration_uid && m.value === model_name))
  if (modelAndIntegrationExists) {
    return {
      model_name,
      integration_uid,
    }
  } else {
    const modelExists = modelsList.find(models => models.find(m => m.value === model_name))
    if (modelExists) {
      return {
        model_name,
        integration_uid: modelExists[0].group,
      }
    }
    return {
      model_name: modelsList[0][0]?.value || '',
      integration_uid: modelsList[0][0]?.group || '',
    }
  }
}

const setDefaultModelsForImportedPrompts = (importedPrompts, modelOptions) => {
  const prompts = [];
  importedPrompts?.forEach(prompt => {
    const newPrompt = {
      ...prompt
    }
    if (prompt.versions) {
      const newVersions = []
      prompt.versions.forEach(version => {
        const newVersion = {
          ...version,
        }
        const { model_settings = { model: {} } } = version;
        const model = getDefaultModel(model_settings?.model, modelOptions)
        newVersion['model_settings'] = {
          ...model_settings,
          model
        };
        newVersions.push(newVersion)
      });
      newPrompt.versions = [...newVersions]
    } else {
      const modelSettings = getDefaultModel({}, modelOptions)
      newPrompt['alita_model'] = modelSettings
    }
    prompts.push(newPrompt)
  });
  return prompts;
}

export default function HeaderSplitButton({ onClickCommand }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme()
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('Prompt');
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const selectedProjectId = useSelectedProjectId();
  const { pathname, state } = useLocation();
  const locationState = useMemo(() => state || ({ from: [], routeStack: [] }), [state]);
  const isFromEditPromptPage = useMemo(() => !!pathname.match(/\/prompts\/\d+/g), [pathname]);
  const isFromCollectionDetailPage = useMemo(() => !!pathname.match(/\/collections\/\d+/g), [pathname]);
  const isFromDataSourceDetailPage = useMemo(() => !!pathname.match(/\/datasources\/\d+/g), [pathname]);
  const isFromApplicationDetailPage = useMemo(() => !!pathname.match(/\/applications\/\d+/g), [pathname]);
  const isFromMyLibrary = useFromMyLibrary();
  const isCreatingNow = useMemo(() => pathname.includes('/create'), [pathname]);
  const shouldReplaceThePage = useMemo(() => isFromEditPromptPage ||
      isFromDataSourceDetailPage ||
      isFromCollectionDetailPage ||
      isFromApplicationDetailPage ||
      isCreatingNow,
    [isCreatingNow, isFromApplicationDetailPage, isFromCollectionDetailPage, isFromDataSourceDetailPage, isFromEditPromptPage]);
  const [importPrompt, {error, isError, isSuccess, isLoading}] = useImportPromptMutation();
  const {shouldDisablePersonalSpace} = useDisablePersonalSpace();
  const [openSelectModel, setOpenSelectModel] = useState(false);
  const [importBody, setImportBody] = useState({});
  const { modelOptions } = useModelOptions();
  const { permissions = [] } = useSelector(s => s.user)

  const options = useMemo(() => {
    const permissionsSet = new Set(permissions)
    return [...Object.keys(optionsMap).filter(i => displayPermissions[i]?.some(p => permissionsSet.has(p)))]
  }, [permissions])

  const onCloseSelectModel = useCallback(
    () => {
      setOpenSelectModel(false);
      setOpen(false);
    },
    [],
  );

  const onConfirmModel = useCallback(
    async () => {
      await importPrompt({ projectId: selectedProjectId, body: importBody })
    },
    [importBody, importPrompt, selectedProjectId],
  );

  const handleCommand = useCallback(
    (option = undefined) => {
      if (onClickCommand) {
        onClickCommand();
      } else {
        const theSelectedOption = option ?? selectedOption;
        const destUrl = commandPathMap[theSelectedOption];
        const breadCrumb = breadCrumbMap[theSelectedOption]
        const search = theSelectedOption === optionsMap.Chat ? 'create=1' : undefined;
        if (destUrl !== pathname || theSelectedOption === optionsMap.Chat) {
          let newRouteStack = [...locationState.routeStack];
          if (isFromMyLibrary && state && theSelectedOption !== optionsMap.Chat) {
            if (shouldReplaceThePage) {
              newRouteStack.splice(locationState.routeStack.length - 1, 1, {
                breadCrumb,
                viewMode: ViewMode.Owner,
                pagePath: destUrl,
              });
            } else {
              newRouteStack.push({
                breadCrumb,
                viewMode: ViewMode.Owner,
                pagePath: destUrl,
              });
            }
          } else {
            //For opening creating page from solo url or from Discover, we treat it as opening it from My Library
            newRouteStack = theSelectedOption === optionsMap.Chat ?
              [
                {
                  breadCrumb,
                  viewMode: ViewMode.Public,
                  pagePath: destUrl,
                }]
              :
              [
                {
                  breadCrumb: PathSessionMap[RouteDefinitions.MyLibrary],
                  pagePath: `${RouteDefinitions.MyLibrary}/${(theSelectedOption + 's').toLowerCase()}?${SearchParams.ViewMode}=${ViewMode.Owner}`,
                },
                {
                  breadCrumb,
                  viewMode: ViewMode.Owner,
                  pagePath: destUrl,
                }
              ];

          }
          navigate({ pathname: destUrl, search}, {
            replace: shouldReplaceThePage,
            state: { routeStack: newRouteStack }
          });

          if (destUrl === RouteDefinitions.CreatePrompt) {
            dispatch(actions.resetCurrentPromptData());
          }
        }
      }
    },
    [
      dispatch,
      onClickCommand,
      selectedOption,
      pathname,
      locationState.routeStack,
      isFromMyLibrary,
      state,
      navigate,
      shouldReplaceThePage
    ]
  );
  const handleClick = useCallback(() => {
    handleCommand()
    setOpen(false);
  }, [handleCommand]);

  const handleMenuItemClick = useCallback(
    (option) => () => {
      setSelectedOption(option);
      setOpen(false);
      handleCommand(option)
    }, [handleCommand]);

  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleClose = useCallback((event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }, []);

  const handleFileUpload = useCallback((event) => {
    const reader = new FileReader();
    const file = event.target.files[0];

    reader.onload = async (e) => {
      const contents = e.target.result;
      let requestBody = JSON.parse(contents);
      if (requestBody?.prompts?.length && Object.values(modelOptions)) {
        const prompts = setDefaultModelsForImportedPrompts(requestBody?.prompts, modelOptions);
        requestBody = {
          ...requestBody,
          prompts,
        }
      }
      setImportBody(requestBody);
      setOpenSelectModel(true);
    };
    reader.readAsText(file);
  }, [modelOptions]);

  const handleImportPrompt = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.onchange = handleFileUpload;
    fileInput.click();
  }, [handleFileUpload])

  const onCloseToast = useCallback(() => {
    setOpenToast(false);
  }, []);

  useEffect(() => {
    if (pathname.toLocaleLowerCase().includes('chat')) {
      setSelectedOption(optionsMap.Chat);
    } else if (pathname.toLocaleLowerCase().includes('collection')) {
      setSelectedOption(optionsMap.Collection);
    } else if (pathname.toLocaleLowerCase().includes('application')) {
      setSelectedOption(optionsMap.Application);
    } else if (pathname.toLocaleLowerCase().includes('datasource')) {
      setSelectedOption(optionsMap.Datasource);
    } else {
      setSelectedOption(optionsMap.Prompt);
    }
  }, [pathname])

  useEffect(() => {
    if (isError) {
      setOpenToast(true);
      setToastSeverity('error');
      setToastMessage(`Import the prompt failed: ${buildErrorMessage(error)}`);
    } else if (isSuccess) {
      onCloseSelectModel()
      setOpenToast(true);
      setToastSeverity('success');
      setToastMessage('Your items have been successfully imported');
      setTimeout(() => {
        const pagePath = `${RouteDefinitions.MyLibrary}/${MyLibraryTabs[0]}?${SearchParams.ViewMode}=${ViewMode.Owner}&statuses=all`;
        const breadCrumb = PathSessionMap[RouteDefinitions.MyLibrary];
        navigate(pagePath, {
          state: {
            routeStack: [{
              breadCrumb,
              pagePath,
            }]
          }
        })
      }, 1000)
    }
  }, [error, isError, isSuccess, navigate, onCloseSelectModel])


  return (
    <>
      <TooltipForDisablePersonalSpace>
        <StyledButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
          <StyledDropdownButton disabled={shouldDisablePersonalSpace} sx={{ pl: 2, pr: 1 }} onClick={handleClick}>
            <PlusIcon fill={theme.palette.primary.main} />
            <span style={{ marginLeft: '8px' }}>{selectedOption}</span>
          </StyledDropdownButton>
          <StyledDivider orientation="vertical" variant="middle" flexItem />
          <StyledDropdownButton disabled={shouldDisablePersonalSpace} sx={{ pl: 1, pr: 2 }}
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select operation"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDownIcon fill={theme.palette.primary.main} />
          </StyledDropdownButton>
        </StyledButtonGroup>
      </TooltipForDisablePersonalSpace>
      <StyledMenu
        id="header-split-menu-list"
        aria-labelledby="header-split-menu-button"
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuSectionHeader>
          <PlusIcon />
          <Typography variant='headingSmall'>Create</Typography>
        </MenuSectionHeader>
        <MenuSectionBody>
          {options.map((option) => (
            <MenuItem
              key={option}
              selected={option === selectedOption}
              onClick={handleMenuItemClick(option)}
            >
              <Typography variant='labelMedium'>{option}</Typography>
              {option === selectedOption &&
                <StyledMenuItemIcon>
                  <CheckedIcon />
                </StyledMenuItemIcon>
              }
            </MenuItem>
          ))}
        </MenuSectionBody>
        <MenuSectionFooter onClick={handleImportPrompt}>
          <ImportIcon style={{ width: '1rem', height: '1rem' }} />
          <Typography variant='headingSmall'>Import</Typography>
        </MenuSectionFooter>
      </StyledMenu>
      <Toast
        open={openToast}
        severity={toastSeverity}
        message={toastMessage}
        onClose={onCloseToast}
      />
      <LoadingIndicator
        open={isLoading}
        title={'Importing...'}
      />
      <ModelSelectDialog
        title='Select a model for the imported prompts'
        open={openSelectModel}
        onClose={onCloseSelectModel}
        onCancel={onCloseSelectModel}
        onConfirm={onConfirmModel}
        importBody={importBody}
        setImportBody={setImportBody}
        errors={error?.data}
      />
    </>
  );
}

HeaderSplitButton.propTypes = {
  onClickCommand: PropTypes.func,
}
