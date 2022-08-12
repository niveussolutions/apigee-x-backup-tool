import backUpApiProxy from "./api-proxy.js";
import backUpSharedFlow from "./shared-flow.js";
import backedUpApiProduct from "./api-product.js";
import backUpDev from "./developers.js";
import backUpDevApp from "./dev-app.js";
import backUpTargetServer from "./target-server.js";
import backUpCustomReports from "./Custom-report.js";
import backupFlowHooks from "./Flow-Hooks.js";

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
