/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  saveCustomReportLocally,
  getCustomReportFromApigee,
  getListOfCustomReportFromApigee,
} = require("./utils.js");
const config = require("./config.js");

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
    reportsInApigee.forEach((cs) => {
      const fileName = `${cs.displayName
        .replace(" ", "-")
        .replace("/", "-")}.json`;
      saveCustomReportLocally(localBackUpPath, fileName, JSON.stringify(cs));
    });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpCustomReports;
