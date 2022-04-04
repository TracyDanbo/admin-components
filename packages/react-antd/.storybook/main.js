const path = require("path");
const css_regex = "/\\.css$/";
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-jest",
  ],

  framework: "@storybook/react",
  core: {
    builder: "webpack5",
  },
  webpackFinal: async (config, { configType }) => {
    const cssRule = config.module.rules.find(
      (_) => _ && _.test && _.test.toString() === css_regex
    );
    config.module.rules.push({
      test: /\.less$/i,
      use: [
        {
          loader: "style-loader",
        },
        {
          loader: "css-loader",
          options: {
            sourceMap: true,
          },
        },
        {
          loader: "less-loader",
          options: {
            lessOptions: {
              javascriptEnabled: true,
              paths: [
                path.resolve(__dirname, "../"),
                /[\\/]node_modules[\\/].*antd/,
              ],
            },
            sourceMap: true,
          },
        },
      ],
    });

    // add surpport module css
    config.module.rules = [
      ...config.module.rules.filter(
        (_) => _ && _.test && _.test.toString() !== css_regex
      ),
      {
        ...cssRule,
        exclude: /\.module\.css$/,
      },
      {
        ...cssRule,
        test: /\.module\.css$/,
        use: cssRule.use.map((_) => {
          if (_ && _.loader && _.loader.match(/[\/\\]css-loader/g)) {
            return {
              ..._,
              options: {
                ..._.options,
                modules: {
                  localIdentName: "[name]__[local]__[hash:base64:5]",
                },
              },
            };
          }
          return _;
        }),
      },
    ];
    // Return the altered config
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias || {}),
          "@": path.resolve(__dirname, "../src/"),
        },
      },
    };
  },
};
