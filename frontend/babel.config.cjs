module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  plugins: [
    [
      "babel-plugin-transform-import-meta",
      {
        // This will replace import.meta.env with an empty object in tests
        replace: { env: {} },
      },
    ],
  ],
};
