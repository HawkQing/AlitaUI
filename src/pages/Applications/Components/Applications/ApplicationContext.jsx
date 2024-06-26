import { contextResolver } from '@/common/utils';
import BasicAccordion, { AccordionShowMode } from '@/components/BasicAccordion';
import FileReaderEnhancer from '@/pages/Prompts/Components/Form/FileReaderInput';
import { useTheme } from '@emotion/react';
import { useFormikContext } from 'formik';
import { useCallback } from 'react';

const ApplicationContext = ({
  style,
  containerStyle,
}) => {
  const theme = useTheme();
  const { values: { version_details }, setFieldValue } = useFormikContext();
  const handleChange = useCallback((value) =>
    setFieldValue('version_details.instructions', value),
    [setFieldValue]);

  const updateVariableList = useCallback((value) => {
    const resolvedInputValue = contextResolver(value);
    setFieldValue('version_details.variables', resolvedInputValue.map(key => {
      const prevValue = (version_details?.variables || []).find(v => v.name === key)
      return {
        name: key,
        value: prevValue?.value || '',
        id: prevValue?.id || undefined,
      }
    }))
  }, [setFieldValue, version_details?.variables]);

  return (
    <BasicAccordion
      style={style}
      showMode={AccordionShowMode.LeftMode}
      accordionSX={{background: `${theme.palette.background.tabPanel} !important`}}
      items={[
        {
          title: 'Instructions',
          content: (
            <div style={containerStyle}>
              <FileReaderEnhancer
                showexpandicon='true'
                id="application-instructions"
                placeholder='Input the instructions here'
                defaultValue={version_details?.instructions}
                onChange={handleChange}
                updateVariableList={updateVariableList}
                label='Instructions'
                multiline
              />
            </div>
          ),
        }
      ]} />
  );
}

export default ApplicationContext