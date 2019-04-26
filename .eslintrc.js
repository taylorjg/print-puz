module.exports = {
  extends: "eslint:recommended",
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  globals: {
    chai: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    "no-console": "off"
  }
}
