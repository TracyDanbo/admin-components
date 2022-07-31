import { UploadFile } from "antd/lib/upload/interface";
export type FormValue = {
  file: UploadFile;
  fileList: Array<UploadFile>;
};
