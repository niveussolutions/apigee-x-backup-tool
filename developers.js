/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  saveDevsLocally,
  getDevConfigFromApigee,
  getListOfDevsFromApigee,
} = require("./utils.js");
const config = require("./config.js");

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "developers";

const backUpDev = async () => {
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
        const devJson = await getDevConfigFromApigee(
          organizationName,
          options,
          dev
        );
        if (!devJson) {
          console.log(
            `Something went wrong: Could not fetch developer ${dev} from Apigee`
          );
          return;
        }
        const fileName = `${devJson.email}.json`;
        saveDevsLocally(localBackUpPath, fileName, JSON.stringify(devJson));
      })
    );
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpDev;
