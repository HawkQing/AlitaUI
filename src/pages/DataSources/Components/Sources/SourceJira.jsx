/* eslint-disable react/jsx-no-bind */
import BasicAccordion from "@/components/BasicAccordion.jsx";
import CheckLabel from "@/components/CheckLabel.jsx";
import GroupedButton from "@/components/GroupedButton";
import SingleSelect from "@/components/SingleSelect.jsx";
import useComponentMode from "@/components/useComponentMode";

import { jiraHostingTypes, tokenTypes, filterTypes } from "@/pages/DataSources/constants";
import { StyledInput } from "@/pages/EditPrompt/Common.jsx";
import { Box } from "@mui/material";
import { useCallback, useMemo, useState } from "react";

const jiraHostingOptions = Object.values(jiraHostingTypes)

const tokenTypeOptions = Object.values(tokenTypes);
const filterOptions = Object.values(filterTypes)

export const initialState = {
  url: '',
  token: '',
  api_key: '',
  hosting: jiraHostingTypes.cloud.value,
  username: '',
  filter_type: filterTypes.project_key.value,
  filter_key: '',
  fields_to_extract: '',
  fields_to_index: '',
  advanced: {
    include_attachments: false,
    request_limit: '50',
    max_issues: '1000'
  }
}
const SourceJira = ({ formik, mode }) => {
  const options = useMemo(() => formik.values.source?.options || {},
    [formik.values.source?.options]);
  const {
    url,
    token,
    api_key,
    hosting,
    username,
    filter_type,
    filter_key,
    fields_to_extract,
    fields_to_index,
    advanced
  } = options;
  const { include_attachments, request_limit, max_issues } = advanced || {}
  const handleChange = useCallback((field, value) => {
    formik.setFieldValue('source.options.' + field, value)
  }, [formik]);

  const inputProps = useMemo(() => ({
    fullWidth: true,
    variant: 'standard',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur
  }), [formik.handleBlur, formik.handleChange])

  const [type, setType] = useState(token ? tokenTypes.token.value : tokenTypes.api_key.value);

  const handleToggle = useCallback(e => {
    const credentialType = e.target.value;
    setType(credentialType)
    if (credentialType === tokenTypes.api_key.value) {
      handleChange(tokenTypes.token.value, '');
    } else {
      handleChange(tokenTypes.api_key.value, '')
    }
  }, [handleChange]);

  const { isCreate, isView } = useComponentMode(mode);

  return (
    <>
      <StyledInput
        required
        autoComplete={'off'}
        name='source.options.url'
        label='URL'
        value={url}
        sx={{ flexGrow: 1 }}
        {...inputProps}
        disabled={!isCreate}
      />
      <Box display={"flex"} width={'100%'}>
        {
          type === tokenTypes.api_key.value ?
            <StyledInput
              required
              autoComplete={'off'}
              name='source.options.api_key'
              label='API Key'
              value={api_key}
              {...inputProps}
              disabled={isView}
            /> :
            <StyledInput
              required
              autoComplete={'off'}
              name='source.options.token'
              label='Token'
              value={token}
              {...inputProps}
              disabled={isView}
            />
        }
        <Box alignSelf={'end'}>
          <GroupedButton
            value={type}
            onChange={handleToggle}
            readOnly={isView}
            buttonItems={tokenTypeOptions}
          />
        </Box>
      </Box>
      <StyledInput
        required
        autoComplete={'off'}
        name='source.options.username'
        label='Username'
        value={username}
        sx={{ flexGrow: 1 }}
        {...inputProps}
        disabled={isView}
      />
      <SingleSelect
        showBorder
        label='Hosting option'
        onValueChange={(value) => handleChange('hosting', value)}
        value={hosting}
        options={jiraHostingOptions}
        customSelectedFontSize={'0.875rem'}
        sx={{ marginTop: '8px' }}
        disabled={isView}
      />
      <Box marginTop={'8px'} paddingTop={'4px'} display={"flex"} width={'100%'} gap={'8px'}
        alignItems={'baseline'}>
        <SingleSelect
          showBorder
          label='Filter'
          onValueChange={(value) => handleChange('filter_type', value)}
          value={filter_type}
          options={filterOptions}
          customSelectedFontSize={'0.875rem'}
          sx={{ flex: '1' }}
          disabled={isView}
        />
        <StyledInput
          name='source.options.filter_key'
          variant='standard'
          fullWidth
          label={filterTypes[filter_type]?.label}
          value={filter_key}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          sx={{ flex: '2' }}
          disabled={!isCreate}
        />
      </Box>
      <StyledInput
        required
        autoComplete={'off'}
        name='source.options.fields_to_extract'
        label='Fields to extract'
        value={fields_to_extract}
        sx={{ flexGrow: 1 }}
        {...inputProps}
        disabled={isView}
      />
      <StyledInput
        required
        autoComplete={'off'}
        name='source.options.fields_to_index'
        label='Fields to index'
        value={fields_to_index}
        sx={{ flexGrow: 1 }}
        {...inputProps}
        disabled={isView}
      />
      <BasicAccordion
        uppercase={false}
        style={{ width: '100%' }}
        defaultExpanded={false}
        items={[
          {
            title: 'Advanced settings',
            content: (
              <Box pl={3} width={'100%'}>
                <CheckLabel
                  disabled={!isCreate}
                  label='Include attachment'
                  checked={include_attachments || false}
                  onChange={e => handleChange('advanced.include_attachments', e.target.checked)}
                />

                <Box paddingTop={'4px'} display={"flex"} width={'100%'} gap={'8px'}>
                  <StyledInput
                    name='source.options.advanced.request_limit'
                    label='Issue limit per request'
                    value={request_limit}
                    {...inputProps}
                    disabled={!isCreate}
                  />
                  <StyledInput
                    name='source.options.advanced.max_issues'
                    label='Max total issues'
                    value={max_issues}
                    {...inputProps}
                    disabled={!isCreate}
                  />
                </Box>
              </Box>
            )
          }
        ]} />
    </>
  )
}
export default SourceJira