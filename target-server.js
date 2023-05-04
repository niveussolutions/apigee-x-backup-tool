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
  getConfig,
  listEnvironments,
} from "./utils.js";

import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

const config = getConfig();
const organizationName = config.organization;
const localBackUpPath = config.backupFolderPath + "target-servers";

const backUpTargetServer = async (all, envName) => {
  if (!all && envName === "None") {
    logError("requires --envName option or provide --all option");
    return;
  }

  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };

    if (all) {
      const envs = await listEnvironments(organizationName, options);
      envs.forEach(async (env) => {
        const targetServersInApigee = await getListOfTargetServersFromApigee(
          organizationName,
          env,
          options
        );

        if (!targetServersInApigee || !Array.isArray(targetServersInApigee)) {
          logError(
            "Something went wrong: Could not fetch target servers from Apigee"
          );
          return;
        }
        await backUpTargetServer(false, env);
      });
    } else if (!all && envName) {
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
    }
  } catch (error) {
    logError(error.message);
  }
};

export default backUpTargetServer;
