/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  saveDevAppLocally,
  getListOfDevsFromApigee,
  getDevAppConfigFromApigee,
  getListOfDevAppsFromApigee,
} = require("./utils.js");
const config = require("./config.js");

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "developer apps";

const backUpDevApp = async () => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const devsInApigee = await getListOfDevsFromApigee(
      organizationName,
      options
    );

    await Promise.all(
      devsInApigee.map(async (dev) => {
        const devAppsInApigee = await getListOfDevAppsFromApigee(
          organizationName,
          dev,
          options
        );
        await Promise.all(
          devAppsInApigee.map(async (app) => {
            const devAppJson = await getDevAppConfigFromApigee(
              organizationName,
              dev,
              app,
              options
            );
            const fileName = `${dev}--${devAppJson.name}.json`;

            saveDevAppLocally(
              localBackUpPath,
              fileName,
              JSON.stringify(devAppJson)
            );
          })
        );
      })
    );
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpDevApp;
