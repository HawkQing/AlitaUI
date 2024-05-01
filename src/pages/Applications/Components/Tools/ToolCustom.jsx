import {useCallback, useState, useMemo} from "react";
import ToolFormBackButton from "./ToolFormBackButton";
import CustomInput from './CustomInput';
import useChangeFormikTools from './useChangeFormikTools';

export default function ToolCustom({
                                     editToolDetail = {},
// eslint-disable-next-line no-unused-vars
                                     setEditToolDetail = (value) => {
                                     },
                                     handleGoBack
                                   }) {
  const {
    name,
    description,
    settings,
    type,
    index,
  } = editToolDetail;
  const {isAdding, onChangeTools} = useChangeFormikTools({toolIndex: index})
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [jsonString, setJsonString] = useState(JSON.stringify({name, description, settings, type}, null, 2))

  const error = useMemo(() => {
    const result = {};
    try {
      JSON.parse(jsonString)
    } catch (_) {
      result['format'] = 'Invalid json, name, description and settings are required for every function'
    }
    return result;
  }, [jsonString])

  const handleChange = useCallback((value) => {
    setJsonString(value)
    setIsDirty(true)
    try {
      const obj = {
        ...editToolDetail,
        ...JSON.parse(value)
      }
      setEditToolDetail(obj)
      onChangeTools(obj)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Invalid json')
    }
  }, [editToolDetail, onChangeTools, setEditToolDetail]);

  const validate = useCallback(() => {
    setIsValidating(true);
    return Object.values(error).some(item => !!item)
  }, [error]);

  // const onTest = useCallback(
  //   () => {
  //     //TODO
  //   },
  //   [],
  // )

  return (
    <>
      <ToolFormBackButton
        label='New custom tool'
        isAdding={isAdding}
        isDirty={isDirty}
        validate={validate}
        handleGoBack={handleGoBack}
      />
      <CustomInput
        value={jsonString}
        onValueChange={handleChange}
        error={isValidating && error.format}
        helperText={isValidating && error.format}
      />
      {/*<NormalRoundButton sx={{ marginTop: isValidating && error.format ? '34px' : '24px' }} onClick={onTest} variant='contained' color='secondary'>*/}
      {/*  Test*/}
      {/*</NormalRoundButton>*/}
    </>
  )
}