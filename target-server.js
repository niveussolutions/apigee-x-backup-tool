/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  saveTargetServerLocally,
  getTargetServerFromApigee,
  getListOfTargetServersFromApigee,
} = require("./utils.js");
const config = require("./config.js");

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "target-servers";

const backUpTargetServer = async () => {
  let envName = process.env.npm_config_envname;
  if (!envName) {
    console.log("Name of the environment is required to backup target server");
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
      console.log(
        "Something went wrong: Could not fetch target servers from Apigee"
      );
      return;
    }

    await Promise.all(
      targetServersInApigee.map(async (ts) => {
        const tsJson = await getTargetServerFromApigee(
          organizationName,
          envName,
          ts,
          options
        );

        if (!tsJson) {
          console.log(
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
      })
    );
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpTargetServer;
