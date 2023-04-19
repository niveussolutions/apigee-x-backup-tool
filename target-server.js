/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();
import {
  saveTargetServerLocally,
  getTargetServerFromApigee,
  getListOfTargetServersFromApigee,
} from "./utils.js";
import config from "./config.js";
import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "target-servers";

const backUpTargetServer = async (envName) => {
  console.log(envName);
  if (!envName) {
    logInfo("Name of the environment is required to backup target server");
    return;
  }

  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const targetServersInApigee = await getListOfTargetServersFromApigee(
      organizationName,
      envName,
      options
    );

    if (!targetServersInApigee || !Array.isArray(targetServersInApigee)) {
      logError(
        "Something went wrong: Could not fetch target servers from Apigee"
      );
      return;
    }

    targetServersInApigee.map(async (ts) => {
      const tsJson = await getTargetServerFromApigee(
        organizationName,
        envName,
        ts,
        options
      );

      if (!tsJson) {
        logError(
          `Something went wrong: Could not get target server ${ts} from Apigee`
        );
        return;
      }

      const fileName = `${tsJson.name}-${envName}.json`;
      saveTargetServerLocally(
        localBackUpPath,
        fileName,
        JSON.stringify(tsJson)
      );
    });
  } catch (error) {
    logError(error.message);
  }
};

export default backUpTargetServer;
