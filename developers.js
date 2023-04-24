/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();
import {
  saveDevsLocally,
  getDevConfigFromApigee,
  getListOfDevsFromApigee,
  getConfig,
} from "./utils.js";

import { logInfo, logError } from "./chalk.js";

const config = getConfig();
const organizationName = config.organization;
const localBackUpPath = config.backupFolderPath + "developers";

const backUpDev = async (all, developerEmail) => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    if (all) {
      const devsInApigee = await getListOfDevsFromApigee(
        organizationName,
        options
      );

      if (!devsInApigee || !Array.isArray(devsInApigee)) {
        logError(
          "Something went wrong: Could not fetch developers from Apigee"
        );
        return;
      } else if (Array.isArray(devsInApigee) && devsInApigee.length === 0) {
        logInfo("No developers found");
        return;
      }

      devsInApigee.map(async (dev) => {
        const devJson = await getDevConfigFromApigee(
          organizationName,
          options,
          dev
        );
        if (!devJson) {
          logError(
            `Something went wrong: Could not fetch developer ${dev} from Apigee`
          );
          return;
        }
        const fileName = `${devJson.email}.json`;
        saveDevsLocally(localBackUpPath, fileName, JSON.stringify(devJson));
      });
    } else if (!all && developerEmail) {
      const devJson = await getDevConfigFromApigee(
        organizationName,
        options,
        developerEmail
      );
      if (!devJson) {
        logError(
          `Something went wrong: Could not fetch developer ${developerEmail} from Apigee`
        );
        return;
      }
      const fileName = `${devJson.email}.json`;
      saveDevsLocally(localBackUpPath, fileName, JSON.stringify(devJson));
    } else {
      throw Error(
        `specify --name option to backup a specific developer or --all option`
      );
    }
  } catch (error) {
    logError(error.message);
  }
};

export default backUpDev;
