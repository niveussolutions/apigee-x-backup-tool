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
} from "./utils.js";
import config from "./config.js";
import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "Custom Reports";

const backUpCustomReports = async () => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
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
  } catch (error) {
    logError(error.message);
  }
};

export default backUpCustomReports;
