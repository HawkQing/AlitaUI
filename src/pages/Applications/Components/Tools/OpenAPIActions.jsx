import { Box, Typography } from '@mui/material'
import OpenAPIActionsTable from './OpenAPIActionsTable';

const OpenAPIActions = ({ selected_tools, sx}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', ...sx }}>
      <Box sx={{ height: '40px', padding: '0px 0px 0px 12px', gap: '10px', display: 'flex', alignItems: 'end' }}>
        <Typography sx={{ textTransform: 'uppercase' }} variant='bodyMedium' color={'default'}>
          Actions
        </Typography>
      </Box>
      <OpenAPIActionsTable selected_tools={selected_tools} />
    </Box>
  )
}

export default OpenAPIActions