import useComponentMode from "@/components/useComponentMode";
import FormikInput from "./FormikInput";
import useOptions from "./useOptions";
import { Box } from "@mui/material";
import { APIKeyTypes } from '../../../../common/constants';
import { useMemo, useState } from 'react';
import SingleSelect from '../../../../components/SingleSelect';
import Toggle from '../../../../components/Toggle';
import { useFormikContext } from 'formik';
import { useSelectedProjectId } from '@/pages/hooks';
import { useSecretsListQuery } from '@/api/secrets';

export const initialState = {
  qtest_api_base_url: '',
  qtest_api_token: '',
  no_of_test_cases_per_page: undefined,
  project_id: '',
  columns: [],
}
const SourceQTest = ({ mode }) => {
  const { touched, errors, setFieldValue, handleChange } = useFormikContext();
  const options = useOptions({ initialState, mode });
  const selectedProjectId = useSelectedProjectId();
  const { data } = useSecretsListQuery(selectedProjectId, { skip: !selectedProjectId })
  const secretsOption = useMemo(() => data?.map((item) => ({ label: item.name, value: item.name })) || [], [data])

  const [api_key_type, setAPIKeyType] = useState(APIKeyTypes.Password.value)
  const {
    qtest_api_base_url = '',
    qtest_api_token = '',
    no_of_test_cases_per_page = '',
    project_id = '',
    columns = []
  } = options

  const { isView } = useComponentMode(mode);

  return (
    <>
      <FormikInput
        required
        name='source.options.qtest_api_base_url'
        label='URL'
        value={qtest_api_base_url}
        sx={{ flexGrow: 1 }}
        disabled={isView}
      />
      <FormikInput
        name='source.options.project_id'
        label='Project ID'
        required
        value={project_id}
        disabled={isView}
        type="number"
      />
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }}>
        {api_key_type === APIKeyTypes.Password.value ?
          <FormikInput
            required
            name='source.options.qtest_api_token'
            label='API Key'
            value={qtest_api_token}
            disabled={isView}
          />
          :
          <SingleSelect
            required
            showBorder
            name='source.options.qtest_api_token'
            id='api_key'
            label='API Key'
            onChange={handleChange}
            value={qtest_api_token}
            error={touched.source?.options?.qtest_api_token && Boolean(errors.source?.options?.qtest_api_token)}
            helperText={touched.source?.options?.qtest_api_token && errors.source?.options?.qtest_api_token}
            options={secretsOption}
            customSelectedFontSize={'0.875rem'}
            sx={{ marginTop: '10px' }}
          />
        }
        <Toggle
          sx={{
            marginBottom: touched.source?.options?.qtest_api_token && Boolean(errors.source?.options?.qtest_api_token) ? '22px' : '0px'
          }}
          value={api_key_type}
          leftValue={APIKeyTypes.Password.value}
          leftLabel={APIKeyTypes.Password.label}
          rightValue={APIKeyTypes.Secret.value}
          rightLabel={APIKeyTypes.Secret.label}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={(_, toggledValue) => {
            setAPIKeyType(toggledValue);
            setFieldValue('source.options.qtest_api_token', '');
          }}
        />
      </Box>
      <FormikInput
        required
        name='source.options.no_of_test_cases_per_page'
        label='Test cases per page'
        value={no_of_test_cases_per_page}
        disabled={isView}
        type="number"
      />
      <FormikInput
        name='source.options.columns'
        label='Columns'
        value={columns.join(',')}
        disabled={isView}
        // eslint-disable-next-line react/jsx-no-bind
        onChange={(event) => {
          setFieldValue('source.options.columns', event.target.value?.split(',') || []);
        }}
      />
    </>
  )
}
export default SourceQTest