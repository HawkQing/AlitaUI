import ClearIcon from '@/components/Icons/ClearIcon';
import { ActionButton } from '@/components/ChatBox/StyledComponents';
import { Box, Typography } from '@mui/material';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

const ChatBoxHeader = ({ conversationName, isStreaming, onStopStreaming, onClear }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
      <Typography variant='bodyMedium' color='secondary'>
        {
          conversationName
        }
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start-end', gap: '16px', }}>
        {
          isStreaming &&
          <ActionButton
            aria-label="stop streaming"
            disabled={false}
            onClick={onStopStreaming}
            sx={{ height: '28px', width: '28px' }}
          >
            <StopCircleOutlinedIcon sx={{ fontSize: '1.13rem' }} color="icon" />
          </ActionButton>
        }
        <ActionButton
          aria-label="clear the chat"
          disabled={false}
          onClick={onClear}
          sx={{ height: '28px', width: '28px' }}
        >
          <ClearIcon sx={{ fontSize: 16 }} />
        </ActionButton>
      </Box>
    </Box>
  )
}

export default ChatBoxHeader