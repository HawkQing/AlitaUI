/* eslint-disable react/jsx-no-bind */
import {Box, Link, Tooltip} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, {useCallback, useState, useEffect, useMemo} from 'react';
import ClearIcon from '@/components/Icons/ClearIcon';
import CopyIcon from '@/components/Icons/CopyIcon';
import {
  ActionButton,
  ChatBodyContainer,
  ChatBoxContainer,
  CompletionContainer,
} from '@/components/ChatBox/StyledComponents';
import styled from '@emotion/styled';
import GenerateFile from './GenerateFile';
import DeduplicateSettings from './DeduplicateSettings';
import {useDeduplicateMutation} from "@/api/datasources.js";
import {useGetComponentHeight, useSelectedProjectId} from "@/pages/hooks.jsx";
import DeduplicateResultContent from "@/pages/DataSources/Components/Datasources/DeduplicateResultContent.jsx";
import CodeIcon from "@mui/icons-material/Code.js";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted.js";
import DownloadIcon from '@mui/icons-material/Download';
import {VITE_SERVER_URL} from "@/common/constants.js";
import DifferenceIcon from '@mui/icons-material/Difference';
import AnimatedProgress from '@/components/AnimatedProgress';
import FullScreenToggle from "@/components/ChatBox/FullScreenToggle.jsx";

const CompletionHeader = styled('div')(() => ({
  display: 'block',
  textAlign: 'end'
}));

const DeduplicatePanel = ({
  deduplicateSettings,
  onChangeDeduplicateSettings,
  versionId,
  deduplicateResult,
  setDeduplicateResult,
  isFullScreenChat,
  setIsFullScreenChat
}) => {
  const {
    componentRef: resultContainerRef,
    componentHeight: resultContainerHeight,
  } = useGetComponentHeight();
  const resultSX = useMemo(() => ({ height: `${resultContainerHeight}px` }), [resultContainerHeight])

  const currentProjectId = useSelectedProjectId()
  const [makeDeduplicate, {data, isLoading, isSuccess}] = useDeduplicateMutation()
  const onRunDuplicate = useCallback(
    async () => {
      setDeduplicateResult([]);
      const payload = {
        projectId: currentProjectId,
        versionId,
        chat_settings_embedding: deduplicateSettings?.chat_settings_embedding
      }
      await makeDeduplicate(payload)
    },
    [setDeduplicateResult, currentProjectId, versionId, deduplicateSettings?.chat_settings_embedding, makeDeduplicate]);

  useEffect(() => {
    if (isSuccess) {
      setDeduplicateResult(data)
    }
  }, [data, isSuccess, setDeduplicateResult])

  const onClearSearch = useCallback(() => {
    setDeduplicateResult([]);
  }, [setDeduplicateResult]);

  const onCopyCompletion = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(deduplicateResult.pairs, null, 2));
  }, [deduplicateResult?.pairs])

  const onGenerateFile = useCallback(
    () => {
      //Generate file
    },
    [],
  )
  const [prettifyResponse, setPrettifyResponse] = useState(true)
  const [showOnlyDiff, setShowOnlyDiff] = useState(false)

  return (
    <Box position={'relative'} display={'flex'} flexDirection={'column'} flexGrow={1}>
      <Box 
         sx={{
           position: 'absolute',
           top: '-12px',
           transform: 'translateY(-100%)',
           right: '0px',
           display: 'flex',
           flexDirection: 'row',
           justifyContent: 'flex-end',
           gap: '8px'
         }}
      >
        <FullScreenToggle
          isFullScreenChat={isFullScreenChat}
          setIsFullScreenChat={setIsFullScreenChat}
        />
        
        <ActionButton
          aria-label="clear deduplicate chat"
          disabled={isLoading}
          onClick={onClearSearch}
          sx={{ height: '28px', width: '28px' }}
        >
          <ClearIcon sx={{fontSize: 16}}/>
        </ActionButton>
      </Box>

      <DeduplicateSettings
        selectedEmbeddingModel={deduplicateSettings?.chat_settings_embedding || {}}
        onChangeEmbeddingModel={(integrationUid, modelName) => {
          onChangeDeduplicateSettings('deduplicate.chat_settings_embedding',
            {
              integration_uid: integrationUid,
              model_name: modelName,
            });
        }}
        generateFile={deduplicateSettings?.chat_settings_embedding?.generate_file}
        onChangeGenerateFile={(value) => onChangeDeduplicateSettings('deduplicate.chat_settings_embedding.generate_file', value)}
        cut_off_option={deduplicateSettings?.chat_settings_embedding?.cut_off_option}
        onChangeCutoffOption={(value) => onChangeDeduplicateSettings('deduplicate.chat_settings_embedding.cut_off_option', value)}
        cut_off_score={deduplicateSettings?.chat_settings_embedding?.cut_off_score}
        onChangeCutoffScore={(value) => onChangeDeduplicateSettings('deduplicate.chat_settings_embedding.cut_off_score', value)}
        onClickRun={onRunDuplicate}
        runDisabled={isLoading || !deduplicateSettings?.chat_settings_embedding?.integration_uid}
      />
      {
        deduplicateSettings.generate_file &&
        <GenerateFile onGenerateFile={onGenerateFile}/>
      }
      
      <ChatBoxContainer
        role="presentation"
        sx={{marginTop: '24px'}}
      >
        <ChatBodyContainer ref={resultContainerRef}>
          <CompletionContainer sx={resultSX}>
            <CompletionHeader>
              <Tooltip title={prettifyResponse ? 'Code format' : 'Pretty format'} placement="top">
                <IconButton onClick={() => {
                  setPrettifyResponse(prevState => !prevState)
                }} color={'secondary'}>
                  {prettifyResponse ? <CodeIcon fontSize={'inherit'}/> :
                    <FormatListBulletedIcon fontSize={'inherit'}/>}
                </IconButton>
              </Tooltip>
              <Tooltip title='Show differences' placement="top">
                <IconButton onClick={() => {
                  setShowOnlyDiff(prevState => !prevState)
                }} color={'secondary'}>
                  <DifferenceIcon fontSize={'inherit'} color={showOnlyDiff ? 'primary' : 'secondary'}/>
                </IconButton>
              </Tooltip>
              <IconButton
                color={'secondary'}
                component={Link}
                download
                href={`${VITE_SERVER_URL}/artifacts/artifact/default/${currentProjectId}/datasource-deduplicate/${deduplicateResult?.xlsx_object}`}
                disabled={!deduplicateResult?.xlsx_object}
              >
                <DownloadIcon fontSize={'inherit'}/>
              </IconButton>
              <IconButton disabled={!deduplicateResult?.pairs} onClick={onCopyCompletion}>
                <CopyIcon sx={{fontSize: '1.13rem'}}/>
              </IconButton>
            </CompletionHeader>
            <Box
              position={'absolute'}
              top={'50%'}
              left={'50%'}
              sx={{transform: 'translate(-50%, 0)'}}
              hidden={!isLoading}
            >
              <AnimatedProgress sx={{
                fontWeight: "400",
                fontSize: "26px",
                lineHeight: "40px",
              }}
                                message='Generating...'
                                duration='2s'
                                width='200px'/>
            </Box>
            <DeduplicateResultContent data={deduplicateResult?.pairs} pretty={prettifyResponse}
                                      showOnlyDiff={showOnlyDiff}/>
          </CompletionContainer>
        </ChatBodyContainer>
      </ChatBoxContainer>
    </Box>
  )
};

DeduplicatePanel.propTypes = {}


export default DeduplicatePanel;