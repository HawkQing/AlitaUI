import { useMemo, useCallback, useRef, useEffect } from "react";
import SingleSelect from '@/components/SingleSelect';
import { Box, Typography } from '@mui/material';
import { AuthenticationTypes } from '@/common/constants';
import OAuthFrom from './OAuthFrom';
import APIKeyFrom from './APIKeyFrom';

export default function AuthenticationSelect({
  onValueChange = () => { },
  value,
  required,
  error,
  sx = {},
}) {
  const endRef = useRef()
  const { type, settings } = value
  const authenticationOptions = useMemo(() => Object.values(AuthenticationTypes), []);
  const onChangeAuthType = useCallback(
    (selectedAuthenticationType) => {
      onValueChange({
        type: selectedAuthenticationType,
        settings: {}
      });
    },
    [onValueChange],
  )

  const onChangeOAuthSettings = useCallback(
    (newOAuthSettings) => {
      onValueChange({
        ...value,
        settings: newOAuthSettings,
      });
    },
    [onValueChange, value],
  )

  const onChangeAPIKeySettings = useCallback(
    (newAPIKeySettings) => {
      onValueChange({
        ...value,
        settings: newAPIKeySettings,
      });
    },
    [onValueChange, value],
  )

  useEffect(() => {
    if (type && type !== AuthenticationTypes.None.value) {
      endRef.current?.scrollIntoView();
    }
  }, [type])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', ...sx }}>
      <Box sx={{ height: '40px', padding: '0px 0px 0px 12px', gap: '10px', display: 'flex', alignItems: 'end' }}>
        <Typography sx={{ textTransform: 'uppercase' }} variant='bodyMedium' color={'default'}>
          Authentication
        </Typography>
      </Box>
      <SingleSelect
        showBorder
        name='authentication'
        label='Authentication'
        onValueChange={onChangeAuthType}
        value={type}
        options={authenticationOptions}
        customSelectedFontSize={'0.875rem'}
        sx={{ marginTop: '8px' }}
        required={required}
      />
      {
        type === AuthenticationTypes.OAuth.value &&
        <OAuthFrom value={settings} onValueChange={onChangeOAuthSettings} error={error} />
      }
      {
        type === AuthenticationTypes.APIKey.value &&
        <APIKeyFrom
          value={settings}
          onValueChange={onChangeAPIKeySettings}
          error={error}
        />
      }
      <div ref={endRef} />
    </Box>
  )
}