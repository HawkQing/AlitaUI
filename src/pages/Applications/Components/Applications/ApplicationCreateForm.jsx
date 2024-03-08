/* eslint-disable no-console */
import { useApplicationCreateMutation } from '@/api/applications';
import { useTagListQuery } from '@/api/prompts';
import { APPLICATION_PAYLOAD_KEY, SearchParams, ViewMode } from '@/common/constants';
import BasicAccordion, { AccordionShowMode } from '@/components/BasicAccordion';
import Button from '@/components/Button';
import { StyledCircleProgress } from '@/components/ChatBox/StyledComponents';
import FileUploadControl from '@/components/FileUploadControl';
import NormalRoundButton from '@/components/NormalRoundButton';
import RadioButtonGroup from '@/components/RadioButtonGroup';
import StyledInputEnhancer from '@/components/StyledInputEnhancer';
import ProjectSelect, { ProjectSelectShowMode } from '@/pages/MyLibrary/ProjectSelect';
import TagEditor from '@/pages/Prompts/Components/Form/TagEditor';
import { useSelectedProjectId } from '@/pages/hooks';
import RouteDefinitions from '@/routes';
import { useTheme } from '@emotion/react';
import { Avatar, Box, Typography } from '@mui/material';
import { isString } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';

const typeOptions = [
  {
    label: 'File',
    value: 'file',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris semper consectetur libero et porta. ' + 
    'Pellentesque tincidunt magna lacus, semper faucibus justo pharetra vitae. ',
  },
  {
    label: 'Git',
    value: 'git',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris semper consectetur libero et porta. ' + 
    'Pellentesque tincidunt magna lacus, semper faucibus justo pharetra vitae. ',
  },
  {
    label: 'Interface',
    value: 'interface',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris semper consectetur libero et porta. ' + 
    'Pellentesque tincidunt magna lacus, semper faucibus justo pharetra vitae. ',
  },
]

const StyledButton = styled(Button)(({ theme }) => (`
  background: ${theme.palette.background.icon.default};
  color: ${theme.palette.text.secondary};
`));

const ApplicationCreateForm = ({
  showProjectSelect = true,
  disableSelectProject = false,
  style,
}) => {
  const navigate = useNavigate();

  const theme = useTheme();
  const [file, setFile] = useState({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [type, setType] = useState(null);
  const projectId = useSelectedProjectId();
  const { data: tagList = {} } = useTagListQuery({ projectId }, { skip: !projectId });
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  const [createRequest, { error, data, isLoading }] = useApplicationCreateMutation()
  const shouldDisableSave = useMemo(() => isLoading || !name || !description || !type, 
    [description, isLoading, name, type])

  const onCancel = useCallback(
    () => {
      navigate(-1)
    },
    [navigate],
  );

  const onClickCreate = useCallback(
    async () => {
      await createRequest({
        name, description, file, type,
        projectId,
        versions: [
          {
            name: 'latest',
            tags
          }
        ]
      })
    },
    [createRequest, name, description, file, type, projectId, tags],
  );

  const onChange = useCallback(
    (keyName) => (event) => {
      if (keyName === APPLICATION_PAYLOAD_KEY.name) {
        setName(event.target.value);
      } else if (keyName === APPLICATION_PAYLOAD_KEY.description) {
        setDescription(event.target.value);
      } else if (keyName === APPLICATION_PAYLOAD_KEY.type) {
        setType(event.target.value);
      }
    },
    [],
  );

  const onChangeTags = useCallback(
    (newTags) => {
      setTags(newTags);
    },
    [],
  )

  useEffect(() => {
    if (error) {
      // todo: handle generic errors
      isString(error.data) ?
        console.error(error) :
        error.data?.forEach(i => {
          // eslint-disable-next-line no-unused-vars
          const { ctx, loc, msg } = i
          switch (loc[0]) {
            case 'name':
              setNameError(msg)
              break
            case 'description':
              setDescriptionError(msg)
              break
            default:
              console.warn('Unhandled error', i)
          }
        })
    } else {
      setNameError('')
      setDescriptionError('')
    }
  }, [error])

  useEffect(() => {
    if (data) {
      const { id } = data
      const pathname = `${RouteDefinitions.MyLibrary}${RouteDefinitions.DataSources}/${id}`;
      const search = `name=${name}&${SearchParams.ViewMode}=${ViewMode.Owner}`;
      data && navigate({
        pathname,
        search,
      },
        {
          replace: true,
          state: {
            routeStack: [{
              breadCrumb: name,
              viewMode: ViewMode.Owner,
              pagePath: `${pathname}?${search}`,
            }],
          },
        })
    }
  }, [data, name, navigate]);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = useCallback((newValue) => {
    const imageUrl = newValue ? URL.createObjectURL(newValue) : null;
    setImagePreview(imageUrl);
    setFile(newValue)
  }, [setFile]);
  return (
    <BasicAccordion
      style={style}
      showMode={AccordionShowMode.LeftMode}
      items={[
        {
          title: 'General',
          content: <div>
            <Box display={'flex'} justifyContent={'space-between'} gap={'8px'}>
                <Box sx={{
                  padding: '14px 0'
                }}>
                  {imagePreview ? 
                  <Avatar sx={{ width: 50, height: 50 }} src={imagePreview} alt="Preview" /> :
                  <Avatar sx={{ width: 50, height: 50 }}>
                    <PhotoSizeSelectActualOutlinedIcon sx={{color: theme.palette.icon.fill.default}}/>
                    </Avatar>}
                </Box>
              <FileUploadControl
                label={'Icon'}
                file={file}
                onChangeFile={handleFileChange}
                accept={'image/*'}
              />
            </Box>
            {
              showProjectSelect &&
              <ProjectSelect
                label={'Project'}
                customSelectedColor={`${theme.palette.text.secondary} !important`}
                showMode={ProjectSelectShowMode.NormalMode}
                selectSX={{
                  borderBottom: `1px solid ${theme.palette.border.lines}`,
                  margin: '12px 4px 0 0 !important',
                  paddingLeft: '12px',
                }}
                disabled={disableSelectProject}
                required
              />
            }
            <StyledInputEnhancer
              autoComplete="off"
              id='name'
              label='Name'
              required
              value={name}
              error={!!nameError}
              helperText={nameError}
              onChange={onChange(APPLICATION_PAYLOAD_KEY.name)}
            />
            <StyledInputEnhancer
              autoComplete="off"
              showexpandicon='true'
              id='prompt-desc'
              label='Description'
              required
              multiline
              maxRows={15}
              onChange={onChange(APPLICATION_PAYLOAD_KEY.description)}
              value={description}
              error={!!descriptionError}
              helperText={descriptionError}
            />
            <TagEditor
              id='tags'
              label='Tags'
              tagList={tagList || []}
              stateTags={tags}
              onChangeTags={onChangeTags}
            />
            <Box>
              <Typography
                component='div'
                variant='labelSmall'
                sx={{ textTransform: 'uppercase', mt: 3, mb: 2 }}
                id="app-type-radio-buttons-group-label"
              >
                Application type
              </Typography>
              <RadioButtonGroup
                value={type}
                onChange={onChange(APPLICATION_PAYLOAD_KEY.type)}
                items={typeOptions}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '20px' }}>
              <NormalRoundButton disabled={shouldDisableSave} variant='contained' onClick={onClickCreate} >
                Create
                {
                  isLoading && <StyledCircleProgress size={16} />
                }
              </NormalRoundButton>
              <StyledButton onClick={onCancel}>
                Cancel
              </StyledButton>
            </Box>
          </div>,
        }
      ]} />
  );
}

export default ApplicationCreateForm