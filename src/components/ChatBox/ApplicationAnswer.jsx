import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Markdown from '../Markdown';
import AlitaIcon from '../Icons/AlitaIcon';
import CopyIcon from '../Icons/CopyIcon';
import DeleteIcon from '../Icons/DeleteIcon';
import RegenerateIcon from '../Icons/RegenerateIcon';
import StyledTooltip from '../Tooltip';
import BasicAccordion from "@/components/BasicAccordion.jsx";
import AnimatedProgress from '@/components/AnimatedProgress';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import { UserMessageContainer, Answer, ButtonsContainer, ReferenceList } from './AIAnswer';
import { useTheme } from '@emotion/react';
import ToolAction from './ToolAction';


const ApplicationAnswer = React.forwardRef((props, ref) => {
  const theme = useTheme();
  const {
    answer,
    hasActions = true,
    onCopy,
    onDelete,
    onRegenerate,
    shouldDisableRegenerate,
    references = [],
    toolActions = [],
    isLoading = false,
    isStreaming,
    onStop,
  } = props
  const [showActions, setShowActions] = useState(false);
  const onMouseEnter = useCallback(
    () => {
      if (hasActions) {
        setShowActions(true);
      }
    },
    [hasActions],
  )
  const onMouseLeave = useCallback(
    () => {
      setShowActions(false);
    },
    [],
  )

  return (
    <UserMessageContainer onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <ListItemAvatar sx={{ minWidth: '24px' }}>
        <AlitaIcon sx={{ fontSize: 24 }} />
      </ListItemAvatar>
      <Box sx={{ flex: 1 }}>
        {
          toolActions.map((action) => {
            return <ToolAction action={action} key={action.id} />
          })
        }
        <Answer
          sx={{
            background: theme.palette.background.icon.default, width: '100%',
            borderRadius: '4px',
            padding: '12px 16px 12px 16px',
            position: 'relative',
            marginTop: toolActions.length ? '8px' : '0px'
          }}>
          {showActions && <ButtonsContainer sx={{ top: '6px', right: '6px' }}>
            {
              isStreaming &&
              <StyledTooltip title={'Stop generating'} placement="top">
                <IconButton onClick={onStop}>
                  <StopCircleOutlinedIcon sx={{ fontSize: '1.3rem' }} color="icon" />
                </IconButton>
              </StyledTooltip>
            }
            {
              onCopy && <StyledTooltip title={'Copy to clipboard'} placement="top">
                <IconButton onClick={onCopy}>
                  <CopyIcon sx={{ fontSize: '1.13rem' }} />
                </IconButton>
              </StyledTooltip>
            }
            {
              onRegenerate &&
              <StyledTooltip title={'Regenerate'} placement="top">
                <div>
                  <IconButton disabled={shouldDisableRegenerate} onClick={onRegenerate} >
                    <RegenerateIcon sx={{ fontSize: '1.13rem' }} />
                  </IconButton>
                </div>
              </StyledTooltip>
            }
            {
              onDelete &&
              <StyledTooltip title={'Delete'} placement="top">
                <IconButton onClick={onDelete}>
                  <DeleteIcon sx={{ fontSize: '1.13rem' }} />
                </IconButton>
              </StyledTooltip>
            }
          </ButtonsContainer>}
          <Markdown>
            {answer}
          </Markdown>
          {isLoading && <AnimatedProgress
            sx={{
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "32px",
            }}
            message='Thinking...'
            duration='2s'
          />}
          <div ref={ref} />
          {references?.length > 0 && <BasicAccordion style={{ marginTop: answer ? '15px' : '37px' }} items={[
            { title: 'References', content: <ReferenceList references={references} /> }
          ]} />}
        </Answer>
      </Box>
    </UserMessageContainer>
  )
})

ApplicationAnswer.displayName = 'ApplicationAnswer'

export default ApplicationAnswer;