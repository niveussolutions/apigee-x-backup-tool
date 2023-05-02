/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();
import {
  saveCustomReportLocally,
  getCustomReportFromApigee,
  getListOfCustomReportFromApigee,
  getConfig,
} from "./utils.js";

import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

const config = getConfig();

const organizationName = config.organization;
const localBackUpPath = config.backupFolderPath + "Custom Reports";

const backUpCustomReports = async (all, crName) => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    if (all) {
      const reportsInApigee = await getListOfCustomReportFromApigee(
        organizationName,
        options
      );
      if (!reportsInApigee || !Array.isArray(reportsInApigee)) {
        logError(
          "Something went wrong: Could not fetch custom reports from Apigee"
        );
        return;
      }
      reportsInApigee.forEach((cs) => {
        const fileName = `${cs.displayName
          .replace(" ", "-")
          .replace("/", "-")}.json`;
        saveCustomReportLocally(localBackUpPath, fileName, JSON.stringify(cs));
      });
    } else if (!all && crName) {
      const data = await getCustomReportFromApigee(
        organizationName,
        crName,
        options
      );
      if (!data) {
        logError(
          `Something went wrong: Not able to fetch custom report from apigee`
        );
        return;
      }
      const fileName = `${data.displayName
        .replace(" ", "-")
        .replace("/", "-")}.json`;
      saveCustomReportLocally(localBackUpPath, fileName, JSON.stringify(data));
    } else {
      throw Error(
        "specify --name option to backup a specific custom report or specify --all option"
      );
    }
  } catch (error) {
    logError(error.message);
  }
};

export default backUpCustomReports;
