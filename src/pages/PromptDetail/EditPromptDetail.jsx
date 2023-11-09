/* eslint-disable react-hooks/exhaustive-deps */
import { PROMPT_PAYLOAD_KEY } from "@/common/constants.js";
import BasicAccordion from '@/components/BasicAccordion';
import Button from '@/components/Button';
import ChatBox from '@/components/ChatBox/ChatBox';
import SettingIcon from '@/components/Icons/SettingIcon';
import SingleSelect from '@/components/SingleSelect';
import Slider from '@/components/Slider';
import { actions as promptSliceActions } from '@/reducers/prompts';
import { Avatar, Grid, TextField, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const StyledGridContainer = styled(Grid)(() => ({
  padding: 0,
}));

const LeftGridItem = styled(Grid)(() => ({
  position: 'relative',
  padding: '0 0.75rem'
}));

const RrightGridItem = styled(Grid)(() => ({
  padding: '0 0.75rem'
}));

const StyledInput = styled(TextField)(() => ({
  marginBottom: '0.75rem',
  '& .MuiFormLabel-root': {
    fontSize: '0.875rem',
    lineHeight: '1.375rem',
    top: '-0.25rem',
    left: '0.75rem'
  },
  '& .MuiInputBase-root': {
    padding: '1rem 0.75rem',
    marginTop: '0'
  }
}));

const StyledInputEnhancer = (props) => {
  const dispatch = useDispatch();
  const handlers = {
    onBlur: useCallback((event) => {
      const { target } = event;
      const { payloadkey } = props;
      dispatch(promptSliceActions.updateCurrentPromptData({
        key: payloadkey,
        data: target?.value
      }))
    }, [])
  }
  return <StyledInput {...props} {...handlers} />
}

const promptDetailLeft = [{
  title: 'General',
  content: <div>
    <StyledInputEnhancer payloadkey={PROMPT_PAYLOAD_KEY.name}  id="prompt-name" label="Name" variant="standard" fullWidth />
    <StyledInputEnhancer payloadkey={PROMPT_PAYLOAD_KEY.description} id="prompt-desc" label="Description" multiline variant="standard" fullWidth />
    <StyledInputEnhancer payloadkey={PROMPT_PAYLOAD_KEY.tags} id="prompt-tags" label="Tags" multiline variant="standard" fullWidth />
  </div>
}, {
  title: 'Context',
  content: <div>
    <StyledInputEnhancer payloadkey={PROMPT_PAYLOAD_KEY.context} id="prompt-context" label="Context (??? hint or label)" multiline variant="standard" fullWidth />
    </div>
}]

const StyledAvatar = styled(Avatar)(({theme}) => ({
  width: '1.75rem',
  height: '1.75rem',
  display: 'flex',
  flex: '0 0 1.75rem',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.secondary.main
}));

const promptDetailRight = [{
  title: 'Variables',
  content: <div>
    <StyledInputEnhancer id="prompt-variables" label="Variables" multiline variant="standard" fullWidth />
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ flex: 8, paddingRight: '1rem'}}>
        <SingleSelect label={'Model'} options={[{
          label: 'gpt-3.5-turbo',
          value: 'gpt-3.5-turbo',
        }, {
          label: 'gpt-4',
          value: 'gpt-4',
        }]}/> 
      </div>
      <div style={{ flex: 6}}><Slider label="Temperature" defaultValue={0.7} range={[0, 1]}/></div>
      <StyledAvatar><SettingIcon fontSize="1rem"/></StyledAvatar>
    </div>
  </div>
}]

const TabBarItems = styled('div')(() => ({
  position: 'absolute', top: '-3.7rem', right: '0.5rem'
}));

const SelectLabel = styled(Typography)(() => ({
  display: 'inline-block'
}))

export default function EditPromptDetail () {
  return (
    <StyledGridContainer container>
      <LeftGridItem item xs={12} lg={6}>
        <TabBarItems>
          <SelectLabel variant="body2">Version</SelectLabel>
          <div style={{ display: 'inline-block', marginRight: '2rem', width: '4rem' }}><SingleSelect options={[]}/> </div>
          <Button variant="contained" color={'secondary'}>Save</Button>
          <Button variant="contained" color={'secondary'}>Cancel</Button>
        </TabBarItems>
        <BasicAccordion items={promptDetailLeft}></BasicAccordion>
      </LeftGridItem>
      <RrightGridItem item xs={12} lg={6}>
        <BasicAccordion items={promptDetailRight}></BasicAccordion>
        <ChatBox/>
      </RrightGridItem>
    </StyledGridContainer>
  )
}