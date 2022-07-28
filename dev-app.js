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

    if (!devsInApigee || !Array.isArray(devsInApigee)) {
      console.log(
        "Something went wrong: Could not fetch developers from Apigee"
      );
      return;
    } else if (Array.isArray(devsInApigee) && devsInApigee.length === 0) {
      console.log("No developers found");
      return;
    }

    await Promise.all(
      devsInApigee.map(async (dev) => {
        const devAppsInApigee = await getListOfDevAppsFromApigee(
          organizationName,
          dev,
          options
        );

        if (!devAppsInApigee || !Array.isArray(devAppsInApigee)) {
          console.log(
            `Something went wrong : Could not fetch apps for developer ${dev}`
          );
          return;
        } else if (
          Array.isArray(devAppsInApigee) &&
          devAppsInApigee.length === 0
        ) {
          console.log(`No apps found for ${dev}`);
          return;
        }

        await Promise.all(
          devAppsInApigee.map(async (app) => {
            const devAppJson = await getDevAppConfigFromApigee(
              organizationName,
              dev,
              app,
              options
            );

            if (!devAppJson) {
              console.log(
                `Something went wrong: Could not fetch app-${app} for developer-${dev}`
              );
            }
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
