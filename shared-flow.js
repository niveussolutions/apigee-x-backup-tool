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

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath;

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

    if (!sfFromApigee || !Array.isArray(sfFromApigee)) {
      console.log(
        `Something went wrong: Could not fetch Shared flows from Apigee`
      );
      return;
    } else if (Array.isArray(sfFromApigee) && sfFromApigee.length === 0) {
      console.log(`No Shared Flows Found`);
      return;
    }

    const backedUpProxiesLocally = getSFAndRevisionsStoredLocally(
      localBackUpPath + "shared flows"
    );

    sfFromApigee.map(async (sf) => {
      try {
        const revisions = await getRevisionsForSharedFlowFromApigee(
          organizationName,
          sf,
          options
        );
        if (!revisions || !Array.isArray(revisions)) {
          console.log(
            `Something is wrong: Cannot fetch revisions for ${sf} from apigee`
          );
          return;
        }

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

            if (!data) {
              console.log(
                `Something went wrong: Could not fetch the revision ${revision} for shared flow ${proxy}`
              );
              return;
            }

            const fileName = `${sf}-revision-${revision}.zip`;

            if (!isBackedUpInLocally) {
              await saveSharedFlowRevisionLocally(
                localBackUpPath + "shared flows",
                fileName,
                data,
                sf,
                revision
              );
            }
          } catch (error) {
            console.error(error.message);
            Promise.reject();
          }
        });
      } catch (error) {
        console.error(error.message);
        Promise.reject();
      }
    });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpSharedFlow;
