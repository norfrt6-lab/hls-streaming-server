/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "plugin:jsx-a11y/recommended", "prettier"],
  rules: {
    "react/no-unescaped-entities": "off",
  },
};
