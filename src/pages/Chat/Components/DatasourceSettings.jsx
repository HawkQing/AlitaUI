import {
  Box,
  Typography,
} from '@mui/material';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_FETCH_K,
  DEFAULT_PAGE_TOP_K
} from '@/common/constants';
import StyledInputEnhancer from '@/components/StyledInputEnhancer';
import {
  AdvanceSettingInputContainer,
  AdvanceSettingSliderContainer
} from '@/pages/Prompts/Components/Form/AdvancedSettings';
import Slider from '@/components/Slider';
import StyledTabs from '@/components/StyledTabs';
import { TabContentDiv } from '@/pages/Prompts/Components/Common';

const EmbeddingModelSettings = ({ chat_settings_embedding, onDatasourceSettings, showLabel = false }) => {
  return (
    <Box>
      {
        showLabel &&
        <Typography variant='subtitle'>
          Embedding Settings
        </Typography>
      }
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
        <Slider
          label='Initial Lookup Result (1 – 50)'
          value={+(chat_settings_embedding.fetch_k ?? DEFAULT_FETCH_K)}
          step={1}
          range={[1, 50]}
          onChange={onDatasourceSettings('chat_settings_embedding.fetch_k')}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
        <Slider
          label='Pages Per Document (1 – 30)'
          value={+(chat_settings_embedding.page_top_k ?? DEFAULT_PAGE_TOP_K)}
          step={1}
          range={[1, 30]}
          onChange={onDatasourceSettings('chat_settings_embedding.page_top_k')}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
        <Slider
          label='Expected Search Results (1 – 40)'
          value={+(chat_settings_embedding.top_k ?? DEFAULT_TOP_K)}
          step={1}
          range={[1, 40]}
          onChange={onDatasourceSettings('chat_settings_embedding.top_k')}
        />
      </AdvanceSettingSliderContainer>
    </Box>
  )
}

const ChatModelSettings = ({ chat_settings_ai, onDatasourceSettings, showLabel = false }) => {
  const focusOnMaxTokens = useRef(false);
  const [maxTokens, setMaxTokens] = useState(chat_settings_ai?.max_tokens || DEFAULT_MAX_TOKENS);
  const onMaxTokensBlur = useCallback(
    () => {
      focusOnMaxTokens.current = false;
      setTimeout(() => {
        if (!focusOnMaxTokens.current && !maxTokens) {
          onDatasourceSettings('chat_settings_ai.max_tokens')(DEFAULT_MAX_TOKENS);
          setMaxTokens(DEFAULT_MAX_TOKENS);
        } else {
          if (maxTokens !== chat_settings_ai?.max_tokens) {
            onDatasourceSettings('chat_settings_ai.max_tokens')(parseInt(maxTokens));
          }
        }
      }, 50);
    },
    [chat_settings_ai?.max_tokens, maxTokens, onDatasourceSettings],
  );

  const onMaxTokensFocus = useCallback(
    () => {
      focusOnMaxTokens.current = true;
    },
    [],
  );

  const onInputMaxTokens = useCallback((event) => {
    event.preventDefault();
    onDatasourceSettings('chat_settings_ai.max_tokens')(event.target.value);
    setMaxTokens(event.target.value);
  }, [onDatasourceSettings]);


  useEffect(() => {
    if (chat_settings_ai?.max_tokens && chat_settings_ai?.max_tokens !== maxTokens) {
      setMaxTokens(chat_settings_ai?.max_tokens)
    }
  }, [chat_settings_ai?.max_tokens, maxTokens])

  return (
    <Box>
      {
        showLabel &&
        <Typography variant='subtitle'>
          Chat Settings
        </Typography>
      }
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
        <Slider
          label='Temperature (0.1 – 1.0)'
          value={chat_settings_ai.temperature ?? DEFAULT_TEMPERATURE}
          step={0.1}
          range={[0.1, 1]}
          onChange={onDatasourceSettings('chat_settings_ai.temperature')}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
        <Slider
          label='Top P (0 – 1)'
          value={+(chat_settings_ai.top_p ?? DEFAULT_TOP_P)}
          range={[0, 1]}
          onChange={onDatasourceSettings('chat_settings_ai.top_p')}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingSliderContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
        <Slider
          label='Top K'
          value={+(chat_settings_ai.top_k ?? DEFAULT_TOP_K)}
          step={1}
          range={[1, 40]}
          onChange={onDatasourceSettings('chat_settings_ai.top_k')}
        />
      </AdvanceSettingSliderContainer>
      <AdvanceSettingInputContainer sx={{ paddingRight: '0 !important', paddingLeft: '0 !important' }}>
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
  )
}


const DatasourceSettings = ({
  chat_settings_ai = {},
  chat_settings_embedding = {},
  onDatasourceSettings,
  verticalMode = false,
}) => {


  return !verticalMode ?
    <StyledTabs
      containerStyle={{ height: 'auto !important' }}
      tabSX={{ background: 'transparent !important', borderBottom: '0px' }}
      panelStyle={{ backgroundColor: 'transparent !important' }}
      tabs={[{
        label: 'Embedding Settings',
        content:
          <TabContentDiv style={{ padding: '0 0' }} >
            <EmbeddingModelSettings chat_settings_embedding={chat_settings_embedding} onDatasourceSettings={onDatasourceSettings} />
          </TabContentDiv>,
      }, {
        label: 'Chat Settings',
        content:
          <TabContentDiv style={{ padding: '0 0' }}>
            <ChatModelSettings chat_settings_ai={chat_settings_ai} onDatasourceSettings={onDatasourceSettings} />
          </TabContentDiv>,
      }]}
    />
    :
    <Box sx={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px'}}>
      <EmbeddingModelSettings chat_settings_embedding={chat_settings_embedding} onDatasourceSettings={onDatasourceSettings} showLabel/>
      <ChatModelSettings chat_settings_ai={chat_settings_ai} onDatasourceSettings={onDatasourceSettings} showLabel/>
    </Box>
    ;
};

export default DatasourceSettings;