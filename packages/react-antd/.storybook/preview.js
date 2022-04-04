import { initialize, mswDecorator } from "msw-storybook-addon";
import { handlers } from "../src/mock/handler";
import "antd/dist/antd.less";

initialize();
export const decorators = [mswDecorator];
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  msw: {
    handlers: {
      order: handlers,
    },
  },
};
