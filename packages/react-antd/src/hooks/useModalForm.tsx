import { Form, FormProps, ModalProps } from "antd";
import { useCallback, useRef } from "react";
import { useToggle } from "./useToggle";
import { useLastState } from "./useLastState";
import { reduceFun, getFileObjArray } from "../utils/helper";

export const useModalForm = <T extends Record<string, any>>(id: string) => {
  const [visible, toggle] = useToggle(false);
  const [loading, toggleLoading] = useToggle(false);
  const [form] = Form.useForm();
  const recordRef = useRef<T | undefined>();
  const getId = useLastState(id);
  const onCancel = useCallback(() => {
    toggle(false);
    form.resetFields();
    recordRef.current = undefined;
  }, [toggle, form]);

  const onEdit = useCallback(
    (values: T, keys?: string[], callback = getFileObjArray) => {
      recordRef.current = values;
      const localValues: any = { ...values };
      if (keys) {
        Object.keys(values).forEach((key) => {
          if (keys.includes(key)) {
            localValues[key] = callback(values[key]);
          }
        });
      }
      form.setFieldsValue(localValues);
      toggle(true);
    },
    [form, toggle]
  );
  const getRecord = useCallback(() => {
    return recordRef.current;
  }, []);

  const getModalProps = useCallback(
    (props?: Omit<ModalProps, "okButtonProps">) => {
      const { onCancel: propsOnCancel, ...others } = props || {};
      return {
        onCancel: reduceFun<React.MouseEvent<HTMLElement, MouseEvent>>(
          onCancel,
          propsOnCancel as Parameters<typeof reduceFun>[0]
        ),
        okButtonProps: {
          htmlType: "submit" as "button" | "submit" | "reset" | undefined,
          form: getId(),
          loading,
        },
        visible,
        title: getRecord() ? "编辑" : "新增",
        ...others,
      };
    },
    [onCancel, visible, getRecord, getId, loading]
  );

  const handleOnFinish = useCallback(
    (onFinish: (formValue: T, record: T | undefined) => Promise<boolean>) => {
      return async (values: T) => {
        toggleLoading();
        const result = await onFinish(values, getRecord());
        if (result) {
          onCancel();
        }
        toggleLoading();
      };
    },
    [form, toggleLoading, onCancel, getRecord]
  );

  const getFormProps = useCallback(
    (props: FormProps = {}) => {
      return { form, id: getId(), ...props };
    },
    [getId, form]
  );

  return {
    form,
    visible,
    toggle,
    onCancel,
    onEdit,
    getModalProps,
    getFormProps,
    getRecord,
    handleOnFinish,
    getFileObjArray,
  };
};
