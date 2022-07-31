import { nanoid } from "nanoid";
export const reduceFun = <T>(...args: Array<(params: T) => void>) => {
  return (e: T) => {
    args.forEach((fun) => {
      fun && fun(e);
    });
  };
};

export const getFileObjArray = (urls: string | string[]) => {
  if (!urls) return undefined;
  if (typeof urls === "string") {
    urls = [urls];
  }
  if (Array.isArray(urls)) {
    return {
      fileList: urls.map((url) => {
        const key = url.split("?")[0];
        const [filename, keyPrefix] = key.split("/").reverse();
        const name = `${keyPrefix}/${filename}`;
        const file = {
          uid: nanoid(), // 文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突
          name, // 文件名
          status: "done", // 状态有：uploading done error removed，被 beforeUpload 拦截的文件没有 status 属性
          thumbUrl: url,
          response: {
            url,
            status: "success",
            name,
          }, // 服务端响应内容
        };
        return file;
      }),
    };
  }
  return undefined;
};

export const mergeProps = (...args: Record<string, any>[]) => {
  const props: Record<string, any> = {};
  const funsObj: Record<string, any[]> = {};
  args.map((obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (props.hasOwnProperty(key)) {
        if (typeof value === "function") {
          if (funsObj[key]) {
            funsObj[key].push(value);
          } else {
            funsObj[key] = [value];
          }
        } else if (typeof value === "object" && value !== null) {
          props[key] = Object.assign({}, props[key], value);
        } else {
          props[key] = value;
        }
      } else {
        props[key] = value;
      }
    });
  });
  Object.entries(funsObj).forEach(([key, value]) => {
    props[key] = reduceFun(...value);
  });
  return props;
};
