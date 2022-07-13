/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  getSFAndRevisionsStoredLocally,
  getListOfAllSharedFlowsFromApigee,
  getRevisionsForSharedFlowFromApigee,
  saveSharedFlowRevisionLocally,
  downloadRevisionForSharedFlow,
} = require("./utils.js");
const config = require("./config.js");

//uncomment the below code to enable backup to cloud storage  and use the name of a bucket u created on cloud storage

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath;
const prefix = "api proxies/";
const delimeter = "/";

const backUpSharedFlow = async () => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const sfFromApigee = await getListOfAllSharedFlowsFromApigee(
      organizationName,
      options
    );

    const backedUpProxiesLocally = getSFAndRevisionsStoredLocally(
      localBackUpPath + "shared flows"
    );

    await Promise.all(
      sfFromApigee.map(async (sf) => {
        try {
          const revisions = await getRevisionsForSharedFlowFromApigee(
            organizationName,
            sf,
            options
          );

          await Promise.all(
            revisions.map(async (revision) => {
              try {
                let isBackedUpInLocally = backedUpProxiesLocally[sf]
                  ? backedUpProxiesLocally[sf].includes(revision)
                  : false;

                if (isBackedUpInLocally) {
                  console.log(
                    `shared flow ${sf} with revision ${revision} is already backed up `
                  );
                  return;
                }

                const data = await downloadRevisionForSharedFlow(
                  sf,
                  revision,
                  organizationName,
                  options.headers.Authorization
                );

                const fileName = `${sf}-revision-${revision}.zip`;

                if (data) {
                  if (!isBackedUpInLocally) {
                    await saveSharedFlowRevisionLocally(
                      localBackUpPath + "shared flows",
                      fileName,
                      data,
                      sf,
                      revision
                    );
                  }
                }
              } catch (error) {
                console.error(error.message);
                Promise.reject();
              }
            })
          );
        } catch (error) {
          console.error(error.message);
          Promise.reject();
        }
      })
    );
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpSharedFlow;
