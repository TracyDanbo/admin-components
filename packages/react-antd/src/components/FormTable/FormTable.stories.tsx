import React, { useCallback, useMemo } from "react";
import axios from "axios";
import { Checkbox, Input } from "antd";
import { HeaderProps, TableInstance } from "react-table";
import { useFormTable, VirtualTable } from "./index";
import { CellType, NormalColumn, VirtualColumn, InputTypes } from "./types";

type DataType = {
  id: string;
  projectName: string;
  deep: string;
  categories: string;
  rt: boolean;
  cp: boolean;
  ci: boolean;
  si: boolean;
  cvvertical: boolean;
  cvlevel: boolean;
  cqs: boolean;
  ptvertical: boolean;
  ptlevel: boolean;
  ttuu: boolean;
  ttcu: boolean;
  ttcd: boolean;
};

export const Virtual = () => {
  const columns: VirtualColumn<DataType>[] = useMemo(
    () => [
      {
        Header: "试验号",
        accessor: "id",
        sticky: "Left",
        sortAble: true,
        form: {
          type: InputTypes.INPUT,
          name: "id",
          label: "试验号",
          rules: [{ required: true }],
          inputProps: {
            placeholder: "请输入试验号，试验号由数字组成",
          },
        },
        Filter: (props: TableInstance<DataType>) => {
          console.log("Filter", props);
          const {
            column: { filterValue, preFilteredRows, setFilter },
          } = props;
          return (
            <Input
              value={filterValue}
              onChange={(e) => {
                setFilter(e.target.value || undefined);
              }}
            />
          );
        },
      },
      {
        Header: "项目名称",
        accessor: "projectName",
        sticky: "Left",
        // Cell: (props) => {
        //   console.log(props);
        //   return "项目名称";
        // },
      },
      {
        Header: "取样深度",
        accessor: "deep",
      },
      { Header: "试验类别", accessor: "categories" },
      {
        id: "rt",
        Header: ({
          getHeaderCheckboxProps,
          checkedRows,
        }: HeaderProps<DataType>) => {
          return (
            <div>
              <span>常规实验{`(${checkedRows({ name: "rt" })})`}</span>
              <Checkbox {...getHeaderCheckboxProps({ name: "rt" })} />
            </div>
          );
        },
        accessor: "rt",
        checkAble: true,
        Cell: ({ row, value }: TableInstance<DataType>) => {
          return (
            <Checkbox
              {...row.getCellCheckboxProps({
                name: "rt",
              })}
            />
          );
        },
      },
      {
        id: "cp",
        Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
          return (
            <div>
              <span>先期固结压力{`(${checkedRows({ name: "cp" })})`}</span>
              <Checkbox {...getHeaderCheckboxProps({ name: "cp" })} />
            </div>
          );
        },
        checkAble: true,
        accessor: "cp",
        Cell: ({ row }: TableInstance<DataType>) => {
          return <Checkbox {...row.getCellCheckboxProps({ name: "cp" })} />;
        },
      },
      {
        id: "ci",
        Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
          return (
            <div>
              <span>压缩指数{`(${checkedRows({ name: "ci" })})`}</span>
              <Checkbox {...getHeaderCheckboxProps({ name: "ci" })} />
            </div>
          );
        },
        checkAble: true,
        accessor: "ci",
        Cell: ({ row }: TableInstance<DataType>) => {
          return <Checkbox {...row.getCellCheckboxProps({ name: "ci" })} />;
        },
      },
      {
        id: "si",
        Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
          return (
            <div>
              <span>回弹指数{`(${checkedRows({ name: "si" })})`}</span>
              <Checkbox {...getHeaderCheckboxProps({ name: "si" })} />
            </div>
          );
        },
        checkAble: true,
        accessor: "si",
        Cell: ({ row }: TableInstance<DataType>) => {
          return <Checkbox {...row.getCellCheckboxProps({ name: "si" })} />;
        },
      },
      {
        Header: "固结系数",
        columns: [
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>垂直{`(${checkedRows({ name: "cvvertical" })})`}</span>
                  <Checkbox
                    {...getHeaderCheckboxProps({ name: "cvvertical" })}
                  />
                </div>
              );
            },
            checkAble: true,
            accessor: "cvvertical",
            Cell: ({ row }) => {
              return (
                <Checkbox
                  {...row.getCellCheckboxProps({ name: "cvvertical" })}
                />
              );
            },
          },
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>水平{`(${checkedRows({ name: "cvlevel" })})`}</span>
                  <Checkbox {...getHeaderCheckboxProps({ name: "cvlevel" })} />
                </div>
              );
            },
            checkAble: true,
            accessor: "cvlevel",
            Cell: ({ row }) => {
              return (
                <Checkbox {...row.getCellCheckboxProps({ name: "cvlevel" })} />
              );
            },
          },
        ],
      },
      {
        Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
          return (
            <div>
              <span>固结快剪{`(${checkedRows({ name: "cqs" })})`}</span>
              <Checkbox {...getHeaderCheckboxProps({ name: "cqs" })} />
            </div>
          );
        },
        checkAble: true,
        accessor: "cqs",
        Cell: ({ row }: TableInstance<DataType>) => {
          return <Checkbox {...row.getCellCheckboxProps({ name: "cqs" })} />;
        },
      },
      {
        Header: "渗透试验",
        columns: [
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>垂直{`(${checkedRows({ name: "ptvertical" })})`}</span>
                  <Checkbox
                    {...getHeaderCheckboxProps({ name: "ptvertical" })}
                  />
                </div>
              );
            },
            checkAble: true,
            accessor: "ptvertical",
            Cell: ({ row }) => {
              return (
                <Checkbox
                  {...row.getCellCheckboxProps({ name: "ptvertical" })}
                />
              );
            },
          },
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>水平{`(${checkedRows({ name: "ptlevel" })})`}</span>
                  <Checkbox {...getHeaderCheckboxProps({ name: "ptlevel" })} />
                </div>
              );
            },
            checkAble: true,
            accessor: "ptlevel",
            Cell: ({ row }) => {
              return (
                <Checkbox {...row.getCellCheckboxProps({ name: "ptlevel" })} />
              );
            },
          },
        ],
      },
      {
        Header: "三轴试验",
        columns: [
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>UU{`(${checkedRows({ name: "ttuu" })})`}</span>
                  <Checkbox {...getHeaderCheckboxProps({ name: "ttuu" })} />
                </div>
              );
            },
            checkAble: true,
            accessor: "ttuu",
            Cell: ({ row }) => {
              return (
                <Checkbox {...row.getCellCheckboxProps({ name: "ttuu" })} />
              );
            },
          },
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>CU{`(${checkedRows({ name: "ttcu" })})`}</span>
                  <Checkbox {...getHeaderCheckboxProps({ name: "ttcu" })} />
                </div>
              );
            },
            checkAble: true,
            accessor: "ttcu",
            Cell: ({ row }) => {
              return (
                <Checkbox {...row.getCellCheckboxProps({ name: "ttcu" })} />
              );
            },
          },
          {
            Header: ({ getHeaderCheckboxProps, checkedRows }: any) => {
              return (
                <div>
                  <span>CD{`(${checkedRows({ name: "ttcd" })})`}</span>
                  <Checkbox {...getHeaderCheckboxProps({ name: "ttcd" })} />
                </div>
              );
            },
            checkAble: true,
            accessor: "ttcd",
            Cell: ({ row }) => {
              return (
                <Checkbox {...row.getCellCheckboxProps({ name: "ttcd" })} />
              );
            },
          },
        ],
      },
    ],
    []
  );

  const request = useCallback((params) => {
    console.log(params);
    const {
      pagination: { current: page, pageSize },
    } = params;
    return axios
      .get("/sandSample", { params: { page, pageSize } })
      .then((response) => {
        if (response.status === 200) {
          const {
            array: data,
            page,
            count: pageSize,
            totalCount: total,
          } = response.data.data;
          return { data, page, pageSize, total, success: true };
        }
        return { data: [], page, pageSize, total: 0, success: false };
      });
  }, []);

  const request2 = useCallback((params) => {
    const { page, pageSize } = params;
    return axios.get("/package").then((response) => {
      if (response.status === 200) {
        const {
          array: data,
          page,
          count: pageSize,
          totalCount: total,
        } = response.data.data;
        return { data, page, pageSize, total, success: true };
      }
      return { data: [], page, pageSize, total: 0, success: false };
    });
  }, []);

  const fields: NormalColumn<any>[] = [
    { title: "序號", dataIndex: "index" },
    {
      width: 200,
      dataIndex: "orderId",
      title: "订单编号",
      form: {
        type: InputTypes.INPUT,
        name: "orderId",
        label: "订单编号",
        rules: [{ required: true }],
        inputProps: {
          placeholder: "请输入订单编号，订单编号由数字组成",
        },
      },
    },
    {
      width: 200,
      title: "订单状态",
      dataIndex: "status",
      form: {
        type: InputTypes.SELECT,
        name: "status",
        label: "订单状态",
        options: [
          { value: 0, label: "全部" },
          { value: 1, label: "进行中" },
          { value: 2, label: "已取消" },
        ],
        inputProps: { mode: "multiple" },
        // valueEnum: {
        //   0: "全部",
        //   1: "进行中",
        //   2: "已取消",
        // },
        // request: () => {
        //   return new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //       resolve({
        //         data: [
        //           { value: 0, label: "全部" },
        //           { value: 1, label: "进行中" },
        //           { value: 2, label: "已取消" },
        //         ],
        //       });
        //     }, 3000);
        //   });
        // },
      },
    },
    {
      dataIndex: "area",
      title: "地区",
      width: 200,
      form: {
        type: InputTypes.CASCADER,
        name: "area",
        label: "地区",
        // request: () => {
        //   return new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //       const options = [
        //         {
        //           value: "zhejiang",
        //           label: "Zhejiang",
        //           children: [
        //             {
        //               value: "hangzhou",
        //               label: "Hangzhou",
        //               children: [
        //                 {
        //                   value: "xihu",
        //                   label: "West Lake",
        //                 },
        //               ],
        //             },
        //           ],
        //         },
        //         {
        //           value: "jiangsu",
        //           label: "Jiangsu",
        //           children: [
        //             {
        //               value: "nanjing",
        //               label: "Nanjing",
        //               children: [
        //                 {
        //                   value: "zhonghuamen",
        //                   label: "Zhong Hua Men",
        //                 },
        //               ],
        //             },
        //           ],
        //         },
        //       ];
        //       resolve({ data: options });
        //     });
        //   });
        // },
        options: [
          {
            value: "zhejiang",
            label: "Zhejiang",
            children: [
              {
                value: "hangzhou",
                label: "Hangzhou",
                children: [
                  {
                    value: "xihu",
                    label: "West Lake",
                  },
                ],
              },
            ],
          },
          {
            value: "jiangsu",
            label: "Jiangsu",
            children: [
              {
                value: "nanjing",
                label: "Nanjing",
                children: [
                  {
                    value: "zhonghuamen",
                    label: "Zhong Hua Men",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      dataIndex: "birthdate",
      title: "出生日期",
      width: 200,
      form: {
        type: InputTypes.DATE,
        name: "birthdate",
        label: "出生日期",
      },
      cell: {
        type: CellType.Switch,
        createProps: () => ({
          async onChange(checked: boolean, record: any) {
            console.log(checked, record);
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve({ error: null, success: { message: "test" } });
              }, 3000);
            });
          },
        }),
      },
    },
    {
      dataIndex: "meetDate",
      title: "会议时间",
      width: 200,
      form: {
        type: InputTypes.DATERANGE,
        name: "meetDate",
        label: "会议时间",
        inputProps: {
          picker: "month",
        },
      },
      cell: {
        type: CellType.NumberInput,
        createProps: () => ({
          async onPressEnter(checked: boolean, record: any) {
            console.log(checked, record);
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve({ error: null, success: { message: "test" } });
              }, 3000);
            });
          },
        }),
      },
    },
    {
      dataIndex: "openTime",
      title: "开幕时间",
      width: 200,
      form: {
        type: InputTypes.DATETIME,
        name: "openTime",
        label: "开幕时间",
      },
      cell: {
        type: CellType.Avatar,
        createProps: () => ({
          src: "https://images.unsplash.com/photo-1645642175546-cb74e77d35d6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOXx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60",
        }),
      },
    },
    {
      dataIndex: "gameTime",
      title: "比赛时间",
      width: 200,
      form: {
        type: InputTypes.TIME,
        name: "gameTime",
        label: "比赛时间",
      },
      cell: {
        customType: "checkbox",
        createProps: (text, record, index) => ({
          defaultChecked: true,
          record,
          onChange: (e: any) => {
            console.log(e, record);
          },
        }),
      },
      fixed: "right",
    },
    {
      dataIndex: "endTime",
      title: "闭幕时间",
      width: 200,
      form: {
        type: InputTypes.TIMERANGE,
        name: "endTime",
        label: "闭幕时间",
      },

      fixed: "right",
    },
  ];

  const { getVirtualTableProps, state, tableRef } = useFormTable({
    columns,
    request,
    type: "virtual",
  });

  console.log(tableRef.current?.instance);
  // const { getNormalTableProps, getFormProps, state, tableRef, formRef } =
  //   useFormTable({
  //     columns: fields,
  //     request: request2,
  //     type: "normal",
  //   });

  return (
    <div style={{ width: 1000, height: 500, overflow: "auto" }}>
      <VirtualTable {...getVirtualTableProps()} />
    </div>
    // <>
    //   <SearchForm {...getFormProps()} />
    //   <Table {...getNormalTableProps()} />
    // </>
  );
};

export default {
  component: VirtualTable,
};
