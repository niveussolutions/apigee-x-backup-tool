/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();
import {
  getSFAndRevisionsStoredLocally,
  getListOfAllSharedFlowsFromApigee,
  getRevisionsForSharedFlowFromApigee,
  saveSharedFlowRevisionLocally,
  downloadRevisionForSharedFlow,
} from "./utils.js";
import config from "./config.js";
import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

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
      logError(
        `Something went wrong: Could not fetch Shared flows from Apigee`
      );
      return;
    } else if (Array.isArray(sfFromApigee) && sfFromApigee.length === 0) {
      logInfo(`No Shared Flows Found`);
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
          logError(
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
              logInfo(
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
              logError(
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
            logError(error.message);
            Promise.reject();
          }
        });
      } catch (error) {
        logError(error.message);
        Promise.reject();
      }
    });
  } catch (error) {
    logError(error.message);
  }
};

export default backUpSharedFlow;
