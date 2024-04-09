import { StyledDialog } from '@/components/StyledDialog';
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
import NormalRoundButton from '@/components/NormalRoundButton';

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

const CreateConversationDialog = ({
  open,
  onClose,
  onCreateNewConversation,
}) => {
  const closeDialog = React.useCallback(() => {
    onClose();
  }, [onClose]);
  const { modelOptions } = useModelOptions();

  const [is_public, setIsPublic] = React.useState(false)
  const [participantType, setParticipantType] = React.useState('model')
  const [selectedChatModel, setSelectedChatModel] = React.useState({})
  const chatModelValue = React.useMemo(() =>
  (
    selectedChatModel.integration_uid &&
      selectedChatModel.model_name ?
      genModelSelectValue(selectedChatModel.integration_uid,
        selectedChatModel.model_name,
        getIntegrationNameByUid(selectedChatModel.integration_uid, modelOptions))
      : ''),
    [modelOptions, selectedChatModel.integration_uid, selectedChatModel.model_name]);

  const [selectedChatDatasource, setSelectedChatDatasource] = React.useState();

  const [selectedChatApplication, setSelectedChatApplication] = React.useState();

  const shouldDisabledStart = React.useMemo(() => !selectedChatModel?.integration_uid, [selectedChatModel?.integration_uid])

  const onSelectType = React.useCallback((event) => {
    setIsPublic(event.target.value);
  }, []);

  const onSelectParticipantType = React.useCallback(
    (e) => {
      const newType = e?.target?.value;
      if (participantType !== newType) {
        setParticipantType(newType);
      }
    },
    [participantType],
  );

  const onChangeChatModel = React.useCallback((integrationUid, modelName) => {
    setSelectedChatModel({
      integration_uid: integrationUid,
      model_name: modelName,
    });
  }, [])

  const onChangeChatDatasource = React.useCallback((datasource) => {
    setSelectedChatDatasource(datasource);
  }, []);

  const onChangeChatApplication = React.useCallback((application) => {
    setSelectedChatApplication(application);
  }, []);

  const onStartConversation = React.useCallback(() => {
    onCreateNewConversation({
      is_public,
      model: selectedChatModel,
      datasource: selectedChatDatasource,
      application: selectedChatApplication,
    })
  }, [is_public, onCreateNewConversation, selectedChatApplication, selectedChatDatasource, selectedChatModel])

  return (
    <StyledDialog
      open={open}
      onClose={closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', padding: '24px 40px 24px 40px', gap: '16px' }}>
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
            value={participantType}
            onChange={onSelectParticipantType}
            buttonItems={buttonItems}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          {
            participantType === 'model' &&
            <SingleGroupSelect
              label={'Model'}
              value={chatModelValue}
              onValueChange={onChangeChatModel}
              options={modelOptions}
            />
          }
          {
            participantType === 'datasource' &&
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
            participantType === 'application' &&
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
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <NormalRoundButton disabled={shouldDisabledStart} sx={{ marginRight: '0px' }} onClick={onStartConversation}>
            Start Conversation
          </NormalRoundButton>
        </Box>
      </Box>
    </StyledDialog>
  );
};

export default CreateConversationDialog;