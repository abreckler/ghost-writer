"use strict";

module.exports = {
  diff: true,
  extension: ["js"],
  package: "./package.json",
  reporter: "mocha-junit-reporter",
  reporterOptions: {
    mochaFile: `./TEST-RESULTS-${new Date().toDateString()}.xml`
  },
  require: "ts-node/register",
  slow: 75,
  timeout: 2000,
  ui: "bdd",
};
