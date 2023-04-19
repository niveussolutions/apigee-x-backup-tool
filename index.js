import backUpApiProxy from "./api-proxy.js";
import backUpSharedFlow from "./shared-flow.js";
import backedUpApiProduct from "./api-product.js";
import backUpDev from "./developers.js";
import backUpDevApp from "./dev-app.js";
import backUpTargetServer from "./target-server.js";
import backUpCustomReports from "./Custom-report.js";
import backupFlowHooks from "./Flow-Hooks.js";
import { listEnvironments } from "./utils.js";

import config from "./config.js";

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();

const organizationName = config.organization;

const authToken = await auth.getAccessToken();

const options = {
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
};

const backUpAll = async () => {
  const envs = await listEnvironments(organizationName, options);

  await backUpApiProxy();
  await backUpSharedFlow();
  await backedUpApiProduct();
  await backUpDev();
  await backUpDevApp();
  await backUpCustomReports();

  envs.forEach(async (env) => {
    await backUpTargetServer(env);
    await backupFlowHooks(env);
  });
};

backUpAll();
