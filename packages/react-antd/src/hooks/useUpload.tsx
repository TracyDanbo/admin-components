import { UploadFile, UploadProps } from "antd/lib/upload/interface";
// import alioss from "~@/utils/aliOSS";
import { useCallback, useMemo } from "react";
import { FormValue } from "../types/universal";

export const useUpload = (
  action: (file: File) => Promise<any>,
  value: Array<UploadFile> | FormValue | undefined,
  shouldUpload: boolean | undefined,
  maxCount?: number
) => {
  const customRequest: UploadProps["customRequest"] = async ({
    onError,
    onSuccess,
    file,
  }) => {
    if (!shouldUpload) {
      onSuccess && onSuccess(file);
      return;
    }
    action(file as File)
      .then((res) => {
        onSuccess && onSuccess(res);
      })
      .catch((error) => {
        onError && onError(error);
      });
  };
  const onPreview = useCallback((file: UploadFile) => {
    let url = file.thumbUrl;
    if (file.originFileObj) {
      const blob = new Blob([file.originFileObj as File], {
        type: (file.originFileObj as File).type,
      });
      url = window.URL.createObjectURL(blob);
    }
    window.open(url, "_blank");
  }, []);

  const fileList = useMemo(() => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "object" && value !== null) {
      return value.fileList;
    }
    return undefined;
  }, [value]);
  const enableAdd = useMemo(() => {
    if (!fileList || !maxCount) return true;
    return fileList.length < (maxCount as number);
  }, [maxCount, fileList]);

  return { customRequest, onPreview, fileList, enableAdd };
};
