/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();
import {
  saveFlowHooksLocally,
  getFlowHooksFromApigee,
  getListOfFlowHooksFromApigee,
} from "./utils.js";
import config from "./config.js";
import { logInfo, logError } from "./chalk.js";

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "Flow-Hooks";

const backUpFlowHooks = async () => {
  let envName = process.env.npm_config_envname;
  if (!envName) {
    logInfo("Name of the environment is required to backup flow hooks");
    return;
  }

  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const flowhooksInApigee = [
      "PreProxyFlowHook",
      "PostProxyFlowHook",
      "PreTargetFlowHook",
      "PostTargetFlowHook",
    ];

    flowhooksInApigee.map(async (fh) => {
      const tsJson = await getFlowHooksFromApigee(
        organizationName,
        envName,
        fh,
        options
      );

      if (!tsJson) {
        logError(
          `Something is wrong: Could not get Flow hook ${fh} from Apigee`
        );
        return;
      }

      const fileName = `${fh}-${envName}.json`;
      saveFlowHooksLocally(localBackUpPath, fileName, JSON.stringify(tsJson));
    });
  } catch (error) {
    logError(error.message);
  }
};

export default backUpFlowHooks;
