import {
  PROMPT_PAYLOAD_KEY
} from "@/common/constants.js";
import { StyledTypography } from '@/components/BasicAccordion';
import SingleSelect from '@/components/SingleSelect';
import Slider from '@/components/Slider';
import { actions as promptSliceActions } from '@/reducers/prompts';
import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyledInputEnhancer } from './Common';


const GridItem = styled(Grid)(() => ({
  padding: '0 0.75rem'
}));

const AdvanceSettingHeaderContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 0rem 0.75rem'
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  textAlign: 'end',
  alignSelf: 'end',
  color: theme.palette.text.info,
  '&:hover': {
    background: 'none',
  }
}));

const AdvanceSettingSelectorContainer = styled(Box)(() => ({ marginTop: '0.5rem' }));

const AdvanceSettingSliderContainer = styled(Box)(() => ({
  marginLeft: '0.5rem',
  marginTop: '0.5rem',
  width: '100%'
}));

const AdvanceSettingButtonContainer = styled(Box)(() => ({
  marginLeft: '0.5rem',
  marginTop: '0.5rem',
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end'
}));

const AdvanceSettingInputContainer = styled(Box)(() => ({ 
  marginLeft: '0.5rem', 
  marginTop: '0.5rem', 
  width: '100%', 
  paddingRight: '0.5rem' 
}));

const AdvancedSettings = ({ onCloseAdvanceSettings, modelOptions, integrationOptions, integration }) => {
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const { model_name = '', top_p, top_k } =
    useSelector(state => state.prompts.currentPrompt);
  const onChange = useCallback(
    (key) => (data) => {
      dispatch(promptSliceActions.updateCurrentPromptData({
        key,
        data,
      }));
    },
    [dispatch],
  );

  const onShowMore = useCallback(
    () => {
      setShowMore(true);
    },
    [],
  );

  return (
    <GridItem item xs={12} lg={2.5}>
      <AdvanceSettingHeaderContainer>
        <StyledTypography>Advanced Settings</StyledTypography>
        <CloseIcon fontSize='1rem' onClick={onCloseAdvanceSettings} />
      </AdvanceSettingHeaderContainer>
      <AdvanceSettingSelectorContainer>
        <SingleSelect
          value={integration}
          label={'Integrations'}
          options={integrationOptions}
        />
      </AdvanceSettingSelectorContainer>
      <AdvanceSettingSelectorContainer>
        <SingleSelect
          value={model_name}
          label={'Model'}
          onValueChange={onChange(PROMPT_PAYLOAD_KEY.modelName)}
          options={modelOptions}
        />
      </AdvanceSettingSelectorContainer>
      <AdvanceSettingSliderContainer>
        <Slider
          label="Top P (0-1)"
          defaultValue={+top_p}
          range={[0, 1]}
          onChange={onChange(PROMPT_PAYLOAD_KEY.topP)}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer>
        <Slider
          label="Top K"
          defaultValue={+top_k}
          range={[1, 40]}
          onChange={onChange(PROMPT_PAYLOAD_KEY.topK)}
        />
      </AdvanceSettingSliderContainer>

      {
        showMore ?
          <AdvanceSettingInputContainer>
            <StyledInputEnhancer
              payloadkey={PROMPT_PAYLOAD_KEY.maxTokens}
              id="maxTokens"
              type="number"
              label="Max Tokens"
              variant="standard"
              fullWidth
            />
          </AdvanceSettingInputContainer>
          :
          <AdvanceSettingButtonContainer>
            <StyledButton onClick={onShowMore} variant="text">+ other settings</StyledButton>
          </AdvanceSettingButtonContainer>
      }
    </GridItem>);
}
export default AdvancedSettings;