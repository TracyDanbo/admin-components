import React, { useMemo, useRef, useImperativeHandle } from "react";
import { Button, Form as AntdForm } from "antd";
import { FormProps } from "antd/lib/form";
import classNames from "classnames";
import {
  CustomField,
  DefaultField,
  Field,
  FieldMap,
  FieldProps,
  InputTypes,
} from "../../types";
import { defaultFieldMap } from "../FieldComponents";
import "./styles.css";

const typeList = [
  InputTypes.SELECT,
  InputTypes.DATERANGE,
  InputTypes.DATE,
  InputTypes.DATETIME,
  InputTypes.CASCADER,
  InputTypes.TIME,
  InputTypes.TIMERANGE,
];

export interface SearchFromProps extends FormProps {
  fields: Field[];
  customFields?: FieldMap;
  onReset: () => void;
  loading?: boolean;
}

const SearchForm = React.forwardRef(
  (
    {
      fields = [],
      customFields,
      children,
      className,
      onReset,
      onFinish,
      loading,
      ...others
    }: SearchFromProps,
    ref
  ) => {
    const fieldMap = useMemo(() => {
      return Object.assign({}, defaultFieldMap, customFields);
    }, [customFields]);
    const formRef = useRef(null);

    useImperativeHandle(ref, () => formRef.current);
    return (
      <AntdForm
        {...others}
        onFinish={onFinish}
        ref={formRef}
        id="search-form-grid"
        className={classNames("form-grid", className)}
      >
        <>
          {fields.map((field) => {
            const type =
              (field as DefaultField)?.type ||
              (field as CustomField)?.customType;
            if (type && fieldMap[type]) {
              const { name, label, rules, ...inputProps } = field;
              const formItemProps = { name, label, rules };
              const Component = fieldMap[type].renderFormItem;
              const getPopupContainer = () =>
                document.getElementById("search-form-grid");
              return (
                <AntdForm.Item {...formItemProps} key={field.name.toString()}>
                  <Component
                    {...(inputProps as unknown as FieldProps)}
                    {...(typeList.includes(type)
                      ? { getPopupContainer }
                      : undefined)}
                  />
                </AntdForm.Item>
              );
            }
            return null;
          })}
          {children}
          {fields.length > 0 && (
            <div className="form-action">
              <Button onClick={onReset}>重置</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                查询
              </Button>
            </div>
          )}
        </>
      </AntdForm>
    );
  }
);

export interface FormProviderProps {
  customFields?: Field;
  children: React.ReactNode;
}

export default SearchForm;
