import { useMemo, useEffect, useRef } from "react";
import SingleSelect from '@/components/SingleSelect';
import { Box } from '@mui/material';
import { OAuthTokenExchangeMethods } from '@/common/constants';
import FormInput from '@/pages/DataSources/Components/Sources/FormInput';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  client_id: yup
    .string('Enter client ID')
    .required('Client ID is required'),
  client_secret: yup
    .string('Enter client secret')
    .required('Client secret is required'),
  auth_url: yup
    .string('Enter authorization url')
    .required('Authorization url is required'),
  token_url: yup
    .string('Enter token url')
    .required('Token url is required'),
  scope: yup
    .string('Enter scope ')
    .required('Scope is required'),
});


export default function OAuthFrom({
  onValueChange = () => { },
  value,
  sx = {},
  error,
}) {
  const refOnValueChange = useRef(onValueChange);
  const formik = useFormik({
    initialValues: value,
    validationSchema,
    onSubmit: () => { },
  });
  const formikRef = useRef(formik);
  useEffect(() => {
    formikRef.current = formik
  }, [formik])

  useEffect(() => {
    if (error) {
      if (!formikRef.current.values.client_id ) {
        formikRef.current.setFieldTouched('client_id', true, true);
      }
      if (!formikRef.current.values.client_secret ) {
        formikRef.current.setFieldTouched('client_secret', true, true);
      }
      if (!formikRef.current.values.auth_url ) {
        formikRef.current.setFieldTouched('auth_url', true, true);
      }
      if (!formikRef.current.values.token_url ) {
        formikRef.current.setFieldTouched('token_url', true, true);
      }
      if (!formikRef.current.values.scope ) {
        formikRef.current.setFieldTouched('scope', true, true);
      }
    }
  }, [error])

  const tokenExchangeMethodOptions = useMemo(() => Object.values(OAuthTokenExchangeMethods), []);

  useEffect(() => {
    if (refOnValueChange.current) {
      refOnValueChange.current(formik.values)
    }
  }, [formik.values]);

  useEffect(() => {
    refOnValueChange.current = onValueChange
  }, [onValueChange])


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', ...sx }} >
      <FormInput
        required
        label='Client ID'
        id='client_id'
        name='client_id'
        value={formik.values.client_id}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.client_id && Boolean(formik.errors.client_id)}
        helperText={formik.touched.client_id && formik.errors.client_id}
      />
      <FormInput
        required
        label='Client Secret'
        id='client_secret'
        name='client_secret'
        value={formik.values.client_secret}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.client_secret && Boolean(formik.errors.client_secret)}
        helperText={formik.touched.client_secret && formik.errors.client_secret}
      />
      <FormInput
        required
        label='Authorization URL'
        id='auth_url'
        name='auth_url'
        value={formik.values.auth_url}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.auth_url && Boolean(formik.errors.auth_url)}
        helperText={formik.touched.auth_url && formik.errors.auth_url}
      />
      <FormInput
        required
        label='Token URL'
        id='token_url'
        name='token_url'
        value={formik.values.token_url}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.token_url && Boolean(formik.errors.token_url)}
        helperText={formik.touched.token_url && formik.errors.token_url}
      />
      <FormInput
        required
        label='Scope'
        id='scope'
        name='scope'
        value={formik.values.scope}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.scope && Boolean(formik.errors.scope)}
        helperText={formik.touched.scope && formik.errors.scope}
      />
      <SingleSelect
        showBorder
        name='method'
        id='method'
        label='Token exchange method'
        onChange={formik.handleChange}
        value={formik.values.method}
        error={formik.touched.method && Boolean(formik.errors.method)}
        helperText={formik.touched.method && formik.errors.method}
        options={tokenExchangeMethodOptions}
        customSelectedFontSize={'0.875rem'}
        sx={{ marginTop: '8px' }}
      />
    </Box>
  )
}