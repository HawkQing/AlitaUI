/* eslint-disable react/jsx-no-bind */
import { Box, Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import ClearIcon from '@/components/Icons/ClearIcon';
import CopyIcon from '@/components/Icons/CopyIcon';
import {
  ActionButton,
  ChatBodyContainer,
  ChatBoxContainer,
  CompletionContainer,
  Message
} from '@/components/ChatBox/StyledComponents';
import styled from '@emotion/styled';
import ChatInput from '@/components/ChatBox/ChatInput';
import { useTheme } from '@emotion/react';
import SearchSettings from './SearchSettings';
import { useSearchMutation } from "@/api/datasources.js";
import { useProjectId, useIsSmallWindow, useGetComponentHeight } from "@/pages/hooks.jsx";
import BasicAccordion, { AccordionShowMode } from "@/components/BasicAccordion.jsx";
import SearchResultContent from "./SearchResultContent.jsx";
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SettingIcon from '@/components/Icons/SettingIcon';
import AdvancedSearchSettings from './AdvancedSearchSettings';
import AnimatedProgress from '@/components/AnimatedProgress';
import FullScreenToggle from "@/components/ChatBox/FullScreenToggle.jsx";

const CompletionHeader = styled('div')(() => ({
  display: 'block',
  textAlign: 'end'
}));

const SearchPanel = ({
  searchSettings,
  onChangeSearchSettings,
  showAdvancedSettings,
  onClickAdvancedSettings,
  onCloseAdvancedSettings,
  versionId,
  searchResult,
  setSearchResult,
  isFullScreenChat,
  setIsFullScreenChat
}) => {
  const theme = useTheme();
  const currentProjectId = useProjectId()
  const { isSmallWindow } = useIsSmallWindow();

  const searchInput = useRef(null);
  const {
    componentRef: resultContainerRef,
    componentHeight: resultContainerHeight,
  } = useGetComponentHeight();
  const resultSX = useMemo(() => ({ height: `${resultContainerHeight}px` }), [resultContainerHeight])

  const [makeSearch, { data, isLoading, isSuccess }] = useSearchMutation()
  const onSearch = useCallback(
    async (query) => {
      setSearchResult({});
      const payload = {
        projectId: currentProjectId,
        versionId,

        chat_history: [{ role: 'user', content: query }],
        str_content: searchSettings.str_content,

        chat_settings_embedding: searchSettings?.chat_settings_embedding,
      }
      await makeSearch(payload)
    },
    [
      setSearchResult,
      currentProjectId,
      versionId,
      searchSettings.str_content,
      searchSettings?.chat_settings_embedding,
      makeSearch]);

  useEffect(() => {
    if (isSuccess) {
      setSearchResult(data)
    }
  }, [data, isSuccess, setSearchResult])

  const onClearSearch = useCallback(() => {
    setSearchResult({});
  }, [setSearchResult]);

  const onCopyCompletion = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(searchResult, null, 2));
  }, [searchResult])

  const [prettifyResponse, setPrettifyResponse] = useState(true)

  const getContent = () => {
    if (searchResult?.findings) {
      if (Array.isArray(searchResult.findings)) {
        return searchResult.findings.map((i, index) =>
          <SearchResultContent data={i} key={index} pretty={prettifyResponse} />
        )
      } else {
        return <SearchResultContent data={searchResult.findings.toString()} pretty={false} />
      }
    }
    return ''
  }

  return (
    <Box position={'relative'} display={'flex'} flexDirection={'column'} flexGrow={1}>
      <Box sx={{
        position: 'absolute',
        top: '-12px',
        transform: 'translateY(-100%)',
        right: '0px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: '8px'
      }}>
        <FullScreenToggle
          isFullScreenChat={isFullScreenChat}
          setIsFullScreenChat={setIsFullScreenChat}
        />
        {!showAdvancedSettings && <ActionButton sx={{ height: '28px', width: '28px' }} onClick={onClickAdvancedSettings}>
          <SettingIcon sx={{ fontSize: 16 }} />
        </ActionButton>}
        <ActionButton
          aria-label="clear the search result"
          disabled={isLoading}
          onClick={onClearSearch}
          sx={{ height: '28px', width: '28px' }}
        >
          <ClearIcon sx={{ fontSize: 16 }} />
        </ActionButton>
      </Box>
      <ChatInput
        ref={searchInput}
        onSend={onSearch}
        isLoading={isLoading}
        disabledSend={isLoading || !searchSettings?.chat_settings_embedding?.integration_uid}
        clearInputAfterSubmit={false}
        shouldHandleEnter
        sx={{
          borderRadius: '0rem 0rem 0rem 0rem',
          borderTop: '0px',
          background: 'transparent',
          borderBottom: `1px solid ${theme.palette.border.lines}`,
          marginTop: '24px',
        }}
        placeholder='Enter your search query'
      />
      {!showAdvancedSettings && <SearchSettings
        selectedEmbeddingModel={searchSettings?.chat_settings_embedding || {}}
        onChangeEmbeddingModel={(integrationUid, modelName) => {
          onChangeSearchSettings(
            'search.chat_settings_embedding',
            {
              integration_uid: integrationUid,
              model_name: modelName,
            });
        }}
      />}
      {
        showAdvancedSettings && isSmallWindow &&
        <Box sx={{ marginY: '24px', paddingX: '2px' }}>
          <AdvancedSearchSettings
            onCloseAdvancedSettings={onCloseAdvancedSettings}
            selectedEmbeddingModel={searchSettings?.chat_settings_embedding || {}}
            onChangeEmbeddingModel={(integrationUid, modelName) => {
              onChangeSearchSettings(
                'search.chat_settings_embedding',
                {
                  integration_uid: integrationUid,
                  model_name: modelName,
                });
            }}
            top_k={searchSettings?.chat_settings_embedding?.top_k}
            onChangeTopK={(value) => onChangeSearchSettings('search.chat_settings_embedding.top_k', value)}
            cut_off_score={searchSettings?.chat_settings_embedding?.cut_off_score}
            onChangeCutoffScore={(value) => onChangeSearchSettings('search.chat_settings_embedding.cut_off_score', value)}
            fetch_k={searchSettings?.chat_settings_embedding?.fetch_k}
            onChangeFetchK={(value) => onChangeSearchSettings('search.chat_settings_embedding.fetch_k', value)}
            page_top_k={searchSettings?.chat_settings_embedding?.page_top_k}
            onChangePageTopK={(value) => onChangeSearchSettings('search.chat_settings_embedding.page_top_k', value)}
            str_content={searchSettings?.chat_settings_embedding?.str_content}
            onChangeStrContent={(event, value) => onChangeSearchSettings('search.chat_settings_embedding.str_content', value)}
          />
        </Box>
      }
      <ChatBoxContainer
        role="presentation"
        sx={{ marginTop: '24px' }}
      >
        <ChatBodyContainer ref={resultContainerRef}>
          <CompletionContainer sx={resultSX}>
            <Message>
              <CompletionHeader>
                <IconButton onClick={() => {
                  setPrettifyResponse(prevState => !prevState)
                }} color={'secondary'}>
                  {prettifyResponse ? <CodeIcon fontSize={'inherit'} /> :
                    <FormatListBulletedIcon fontSize={'inherit'} />}
                </IconButton>
                <IconButton disabled={!searchResult} onClick={onCopyCompletion}>
                  <CopyIcon sx={{ fontSize: '1.13rem' }} />
                </IconButton>
              </CompletionHeader>
              <Box
                position={'absolute'}
                top={'50%'}
                left={'50%'}
                sx={{ transform: 'translate(-50%, 0)' }}
                hidden={!isLoading}
              >
                <AnimatedProgress sx={{
                  fontWeight: "400",
                  fontSize: "26px",
                  lineHeight: "40px",
                }}
                  message='Searching...'
                  duration='2s'
                  width='200px'
                />
              </Box>
              <Stack spacing={1}>
                <BasicAccordion
                  style={{ visibility: searchResult?.references ? 'visible' : 'hidden' }}
                  accordionSX={{ background: `${theme.palette.background.tabPanel} !important` }}
                  showMode={AccordionShowMode.LeftMode}
                  defaultExpanded={false}
                  items={[
                    {
                      title: 'References',
                      content: searchResult?.references?.map((i, index) => <pre key={index}>{i}</pre>),
                    }
                  ]}
                />
                {getContent()}
              </Stack>
            </Message>
          </CompletionContainer>
        </ChatBodyContainer>
      </ChatBoxContainer>
    </Box>
  )
};

export default SearchPanel;