import { rest } from "msw";

export const handlers = [
  rest.get("/order", (req, res, ctx) => {
    const tableData = [
      { id: "123456" },
      { id: "2345", endTime: "13456342wesdhggfgsdfsf" },
    ];
    return res(
      ctx.json({
        data: {
          array: tableData,
          count: 20,
          page: 1,
        },
      })
    );
  }),
  rest.get("/package", (req, res, ctx) => {
    const tableData = [];
    for (let i = 1; i <= 20; i++) {
      tableData.push({
        id: i.toString(),
        endTime: "13456342wesdhggfgsdfsf",
      });
    }
    return res(
      ctx.json({
        data: {
          array: tableData,
          count: 20,
          page: 1,
          totalPages: 10,
          totalCount: tableData.length * 10,
        },
      })
    );
  }),
  rest.get("/sandSample", (req, res, ctx) => {
    const page = req.url.searchParams.get("page");
    let v = [];
    for (let i = 1; i <= 20; i++) {
      v.push({
        id: i.toString(),
        projectName: "测试",
        deep: 12,
        categories: i % 2 === 0,
        rt: i % 2 === 0 ? false : true,
        cp: i % 2 === 0 ? true : false,
        ci: i % 2 === 0 ? true : false,
        si: i > 30 ? true : false,
        cvvertical: i % 2 === 0 ? false : true,
        cvlevel: i % 2 === 0 ? false : true,
        cqs: i > 70 ? true : false,
        ptvertical: i > 70 ? true : false,
        ptlevel: i > 70 ? true : false,
        ttuu: i > 70 ? true : false,
        ttcu: i > 70 ? true : false,
        ttcd: i > 70 ? true : false,
      });
    }
    return res(
      ctx.json({
        data: {
          array: v,
          count: 100,
          page: page ? parseInt(page, 10) : 1,
          totalPages: 10,
          totalCount: v.length * 10,
        },
      })
    );
  }),
];
