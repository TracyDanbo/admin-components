import React, { useMemo, useRef, useImperativeHandle } from "react";
import { Form as AntdForm } from "antd";
import { FormProps } from "antd/lib/form";
import {
  CustomField,
  DefaultField,
  Field,
  FieldMap,
  FieldProps,
} from "../../types";
import { defaultFieldMap } from "../default";

export interface SearchFromProps extends FormProps {
  fields: Field[];
  customFields?: FieldMap;
}

const SearchForm = React.forwardRef(
  (
    { fields = [], customFields, children, ...others }: SearchFromProps,
    ref
  ) => {
    const fieldMap = useMemo(() => {
      return Object.assign({}, defaultFieldMap, customFields);
    }, [customFields]);
    const formRef = useRef(null);
    useImperativeHandle(ref, () => formRef.current);
    return (
      <AntdForm {...others} ref={formRef}>
        {fields.map((field) => {
          const type =
            (field as DefaultField)?.type || (field as CustomField)?.customType;
          if (type && fieldMap[type]) {
            const { name, label, rules, ...inputProps } = field;
            const formItemProps = { name, label, rules };
            const Component = fieldMap[type].renderFormItem;

            return (
              <AntdForm.Item {...formItemProps} key={field.name.toString()}>
                <Component {...(inputProps as unknown as FieldProps)} />
              </AntdForm.Item>
            );
          }
          return null;
        })}
        {children}
      </AntdForm>
    );
  }
);

export interface FormProviderProps {
  customFields?: Field;
  children: React.ReactNode;
}

export default SearchForm;
