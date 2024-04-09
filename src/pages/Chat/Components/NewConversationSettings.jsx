import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import * as React from 'react';
import { StatusDot } from '@/components/StatusDot';
import { PromptStatus } from '@/common/constants';
import GroupedButton from '@/components/GroupedButton';
import useModelOptions from '@/pages/DataSources/Components/Datasources/useModelOptions';
import SingleGroupSelect from '@/components/SingleGroupSelect';
import { genModelSelectValue, getIntegrationNameByUid } from '@/common/promptApiUtils';
import DatasourceSelect from '@/pages/Applications/Components/Tools/DatasourceSelect';
import ApplicationSelect from './ApplicationSelect';
import { useTheme } from '@emotion/react';

const DialogTitleDiv = styled('div')(() => ({
  width: '100%',
}));

const buttonItems = [{
  label: 'Model',
  value: 'model',
}, {
  label: 'Datasource',
  value: 'datasource',
}, {
  label: 'Application',
  value: 'application',
}]

const NewConversationSettings = ({
  is_public,
  setIsPublic,
  selectedChatModel,
  setSelectedChatModel,
  selectedChatDatasource,
  setSelectedChatDatasource,
  selectedChatApplication,
  setSelectedChatApplication,
}) => {
  const theme = useTheme();
  const { modelOptions } = useModelOptions();
  const [currentSettingType, setCurrentSettingType] = React.useState('model')
  const chatModelValue = React.useMemo(() =>
  (
    selectedChatModel.integration_uid &&
      selectedChatModel.model_name ?
      genModelSelectValue(selectedChatModel.integration_uid,
        selectedChatModel.model_name,
        getIntegrationNameByUid(selectedChatModel.integration_uid, modelOptions))
      : ''),
    [modelOptions, selectedChatModel.integration_uid, selectedChatModel.model_name]);

  const onSelectType = React.useCallback((event) => {
    setIsPublic(event.target.value);
  }, [setIsPublic]);

  const onSelectParticipantType = React.useCallback(
    (e) => {
      const newType = e?.target?.value;
      if (currentSettingType !== newType) {
        setCurrentSettingType(newType);
      }
    },
    [currentSettingType],
  );

  const onChangeChatModel = React.useCallback((integrationUid, modelName) => {
    setSelectedChatModel({
      integration_uid: integrationUid,
      model_name: modelName,
    });
  }, [setSelectedChatModel])

  const onChangeChatDatasource = React.useCallback((datasource) => {
    setSelectedChatDatasource(datasource);
  }, [setSelectedChatDatasource]);

  const onChangeChatApplication = React.useCallback((application) => {
    setSelectedChatApplication(application);
  }, [setSelectedChatApplication]);

  return (
    <Box sx={{
      width: '100%',
      flexGrow: 1,
      height: 'calc(100vh - 200px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Box sx={{
        display: 'flex',
        width: '80%',
        maxWidth: '600px',
        flexDirection: 'column',
        padding: '24px 40px 24px 40px',
        gap: '16px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.border.table}`,
        background: theme.palette.background.userInputBackground
      }}>
        <DialogTitleDiv>
          <Typography variant='headingMedium'>
            New Conversation
          </Typography>
        </DialogTitleDiv>
        <Box >
          <RadioGroup
            row
            aria-labelledby="private-public-radio-buttons-group-label"
            name="private-public-radio-buttons-group"
            sx={{ gap: '24px' }}
            value={is_public}
            onChange={onSelectType}
          >
            <FormControlLabel
              value={false}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <StatusDot size='10px' status={PromptStatus.Draft} />
                  <Typography variant='bodyMedium'>
                    Private
                  </Typography>
                </Box>
              } />
            <FormControlLabel
              value={true}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <StatusDot size='10px' status={PromptStatus.Published} />
                  <Typography variant='bodyMedium'>
                    Public
                  </Typography>
                </Box>
              } />
          </RadioGroup>
        </Box>
        <Box >
          <GroupedButton
            value={currentSettingType}
            onChange={onSelectParticipantType}
            buttonItems={buttonItems}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          {
            currentSettingType === 'model' &&
            <SingleGroupSelect
              label={'Model'}
              value={chatModelValue}
              onValueChange={onChangeChatModel}
              options={modelOptions}
            />
          }
          {
            currentSettingType === 'datasource' &&
            <DatasourceSelect
              required
              onValueChange={onChangeChatDatasource}
              value={selectedChatDatasource}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
          {
            currentSettingType === 'application' &&
            <ApplicationSelect
              required
              onValueChange={onChangeChatApplication}
              value={selectedChatApplication}
              error={false}
              helperText={''}
              shouldUseSelectedProject
            />
          }
        </Box>
      </Box>
    </Box>
  );
};

export default NewConversationSettings;