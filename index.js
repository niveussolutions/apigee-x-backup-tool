const backUpApiProxy = require("./api-proxy.js");
const backUpSharedFlow = require("./shared-flow.js");
const backedUpApiProduct = require("./api-product");
const backUpDev = require("./developers");
const backUpDevApp = require("./dev-app");
const backUpTargetServer = require("./target-server");
const backUpCustomReports = require("./Custom-report");
const backupFlowHooks = require("./Flow-Hooks.js");

const backUpAll = async () => {
  await backUpApiProxy();
  await backUpSharedFlow();
  await backedUpApiProduct();
  await backUpDev();
  await backUpDevApp();
  await backUpTargetServer();
  await backUpCustomReports();
  await backupFlowHooks();
};

backUpAll();
