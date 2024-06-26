import { getValueByPath } from '@/common/utils';
import StyledInputEnhancer from "@/components/StyledInputEnhancer";
import { StyledInput } from "@/pages/Prompts/Components/Common";
import { useFormikContext } from "formik";
import { useMemo } from "react";

/** Only use it inside formik form, otherwise useFormikContext won't work */
export default function FormikInput({ value, inputEnhancer, ...props }) {
  const { errors, touched, handleBlur, handleChange: handleFieldChange } = useFormikContext();

  const inputProps = useMemo(() => ({
    fullWidth: true,
    autoComplete: 'off',
    variant: 'standard',
    onChange: handleFieldChange,
    onBlur: handleBlur,
    error: getValueByPath(touched, props.name) && Boolean(getValueByPath(errors, props.name)),
    helperText: !!getValueByPath(touched, props.name) && getValueByPath(errors, props.name)
  }), [errors, handleBlur, handleFieldChange, props.name, touched])

  return (
    inputEnhancer ?
      <StyledInputEnhancer
        {...inputProps}
        {...props}
        value={value ?? ''}
      /> :
      <StyledInput
        {...inputProps}
        {...props}
        value={value ?? ''}
      />
  );
}