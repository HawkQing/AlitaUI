/* eslint-disable react/jsx-no-bind */
import BasicAccordion from "@/components/BasicAccordion.jsx";
import CheckLabel from "@/components/CheckLabel.jsx";
import GroupedButton from "@/components/GroupedButton";
import SingleSelect from "@/components/SingleSelect.jsx";
import useComponentMode from "@/components/useComponentMode";
import {
  confluenceContentFormats,
  confluenceFilterTypes,
  hostingTypes,
  tokenTypes
} from "@/pages/DataSources/constants";
import { Box } from "@mui/material";
import { useFormikContext } from "formik";
import { useCallback, useState } from "react";
import FormikInput from "./FormikInput";
import useOptions from "./useOptions";
import { useTheme } from '@emotion/react';

const hostingOptions = Object.values(hostingTypes)
const tokenTypeOptions = Object.values(tokenTypes);
const contentFormatOptions = Object.values(confluenceContentFormats);
const filterOptions = Object.values(confluenceFilterTypes);


export const initialState = {
  url: '',
  token: undefined,
  api_key: '',
  hosting_option: hostingTypes.cloud.value,
  username: '',
  filter: confluenceFilterTypes.space_key.value,
  filter_value: '',
  include_attachments: false,
  pages_limit_per_request: '10',
  max_total_pages: '100',
  content_format: confluenceContentFormats.view.value,
}


const SourceConfluence = ({ mode }) => {
  const theme = useTheme();
  const { setFieldValue } = useFormikContext();
  const options = useOptions({ initialState, mode });
  const {
    url = '',
    token = '',
    api_key = '',
    hosting_option = hostingTypes.cloud.value,
    username = '',
    filter = confluenceFilterTypes.space_key.value,
    filter_value = '',
    include_attachments = false,
    pages_limit_per_request = '10',
    max_total_pages = '100',
    content_format = confluenceContentFormats.view.value,
  } = options;
  const handleChange = useCallback((field, value) => {
    setFieldValue('source.options.' + field, value)
  }, [setFieldValue]);

  const [type, setType] = useState(token ? tokenTypes.token.value : tokenTypes.api_key.value);

  const handleToggle = useCallback(e => {
    const credentialType = e.target.value;
    setType(credentialType)
    if (credentialType === tokenTypes.api_key.value) {
      handleChange(tokenTypes.token.value, undefined);
    } else {
      handleChange(tokenTypes.api_key.value, undefined)
    }
  }, [handleChange]);

  const { isCreate, isView } = useComponentMode(mode);

  return (
    <>
      <FormikInput
        required
        autoComplete={'off'}
        name='source.options.url'
        label='URL'
        value={url}
        sx={{ flexGrow: 1 }}
        disabled={!isCreate}
      />
      <Box display={"flex"} width={'100%'}>
        {
          type === tokenTypes.api_key.value ?
            <FormikInput
              required
              autoComplete={'off'}
              name='source.options.api_key'
              label='API Key'
              value={api_key}
              disabled={isView}
            /> :
            <FormikInput
              required
              autoComplete={'off'}
              name='source.options.token'
              label='Token'
              value={token}
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
      <FormikInput
        required
        autoComplete={'off'}
        name='source.options.username'
        label='Username'
        value={username}
        sx={{ flexGrow: 1 }}
        disabled={isView}
      />
      <SingleSelect
        showBorder
        label='Hosting option'
        onValueChange={(value) => handleChange('hosting_option', value)}
        value={hosting_option}
        options={hostingOptions}
        customSelectedFontSize={'0.875rem'}
        sx={{ marginTop: '8px' }}
        disabled={isView}
      />
      <Box marginTop={'8px'} paddingTop={'4px'} display={"flex"} width={'100%'} gap={'8px'}
        alignItems={'baseline'}>
        <SingleSelect
          showBorder
          label='Filter'
          onValueChange={(value) => handleChange('filter', value)}
          value={filter}
          options={filterOptions}
          customSelectedFontSize={'0.875rem'}
          sx={{ flex: '1' }}
          disabled={!isCreate}
        />
        <FormikInput
          name='source.options.filter_value'
          label={confluenceFilterTypes[filter]?.label}
          value={filter_value}
          sx={{ flex: '2' }}
          disabled={!isCreate}
        />
      </Box>
      <BasicAccordion
        accordionSX={{ background: `${theme.palette.background.tabPanel} !important` }}
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
                  onChange={e => handleChange('include_attachments', e.target.checked)}
                />
                <SingleSelect
                  showBorder
                  label='Content format'
                  onValueChange={(value) => handleChange('content_format', value)}
                  value={content_format}
                  options={contentFormatOptions}
                  customSelectedFontSize={'0.875rem'}
                  sx={{ flex: '1' }}
                  disabled={!isCreate}
                />

                <Box paddingTop={'4px'} display={"flex"} width={'100%'} gap={'8px'}>
                  <FormikInput
                    name='source.options.pages_limit_per_request'
                    label='Pages limit per request'
                    value={pages_limit_per_request}
                    disabled={!isCreate}
                  />
                  <FormikInput
                    name='source.options.max_total_pages'
                    label='Max total pages'
                    value={max_total_pages}
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
export default SourceConfluence