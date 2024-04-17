import {
  Box,
} from '@mui/material';
import React, { useState, useCallback, useRef } from 'react';
import {
  PROMPT_PAYLOAD_KEY,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE
} from '@/common/constants';
import StyledInputEnhancer from '@/components/StyledInputEnhancer';
import {
  AdvanceSettingInputContainer,
  AdvanceSettingSliderContainer
} from '@/pages/Prompts/Components/Form/AdvancedSettings';
import Slider from '@/components/Slider';



const LLMSettings = ({
  llmSettings = {},
  onChangeLLMSettings,
}) => {
  const focusOnMaxTokens = useRef(false);
  const [maxTokens, setMaxTokens] = useState(llmSettings?.max_tokens || DEFAULT_MAX_TOKENS);
  const onMaxTokensBlur = useCallback(
    () => {
      focusOnMaxTokens.current = false;
      setTimeout(() => {
        if (!focusOnMaxTokens.current && !maxTokens) {
          onChangeLLMSettings(PROMPT_PAYLOAD_KEY.maxTokens)(DEFAULT_MAX_TOKENS);
          setMaxTokens(DEFAULT_MAX_TOKENS);
        } else {
          if (maxTokens !== llmSettings?.max_tokens) {
            onChangeLLMSettings(PROMPT_PAYLOAD_KEY.maxTokens)(parseInt(maxTokens));
          }
        }
      }, 50);
    },
    [llmSettings?.max_tokens, maxTokens, onChangeLLMSettings],
  );

  const onMaxTokensFocus = useCallback(
    () => {
      focusOnMaxTokens.current = true;
    },
    [],
  );

  const onInputMaxTokens = useCallback((event) => {
    event.preventDefault();
    setMaxTokens(event.target.value);
  }, []);

  return (
    <Box>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important' }}>
        <Slider
          label='Temperature (0.1 - 1.0)'
          value={llmSettings.temperature ?? DEFAULT_TEMPERATURE}
          step={0.1}
          range={[0.1, 1]}
          onChange={onChangeLLMSettings(PROMPT_PAYLOAD_KEY.temperature)}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important' }}>
        <Slider
          label='Top P (0-1)'
          value={+(llmSettings.top_p ?? DEFAULT_TOP_P)}
          range={[0, 1]}
          onChange={onChangeLLMSettings(PROMPT_PAYLOAD_KEY.topP)}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important' }}>
        <Slider
          label='Top K'
          value={+(llmSettings.top_k ?? DEFAULT_TOP_K)}
          step={1}
          range={[1, 40]}
          onChange={onChangeLLMSettings(PROMPT_PAYLOAD_KEY.topK)}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingInputContainer sx={{ paddingRight: '0 !important' }}>
        <StyledInputEnhancer
          onBlur={onMaxTokensBlur}
          onFocus={onMaxTokensFocus}
          onInput={onInputMaxTokens}
          value={maxTokens}
          id="max_tokens"
          type="number"
          label="Maximum length"
          variant="standard"
          placeholder="Input maximum length here"
          fullWidth
        />
      </AdvanceSettingInputContainer>
    </Box>
  );
};

export default LLMSettings;