/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";

import {
  getProxyAndRevisionsStoredLocally,
  getListOfAllApiProxiesFromApigee,
  getRevisionsForProxyFromApigee,
  downloadRevisionForProxy,
  saveProxyRevisionLocally,
  getConfig,
} from "./utils.js";

import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

const backUpApiProxy = async (all, apiProxyName, apiProxyRevision) => {
  const config = getConfig();
  const auth = new GoogleAuth();

  const organizationName = config.organization;
  const localBackUpPath = config.backupFolderPath;
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    if (all) {
      const proxiesFromApigee = await getListOfAllApiProxiesFromApigee(
        organizationName,
        options
      );

      if (!proxiesFromApigee || !Array.isArray(proxiesFromApigee)) {
        logError(
          "Something went wrong: Could not fetch  Api proxies from Apigee"
        );
        return;
      } else if (
        Array.isArray(proxiesFromApigee) &&
        proxiesFromApigee.length === 0
      ) {
        logInfo("No Api proxies found");
        return;
      }

      const backedUpProxiesLocally = getProxyAndRevisionsStoredLocally(
        localBackUpPath + "api proxies"
      );

      proxiesFromApigee.map(async (proxy) => {
        try {
          const revisions = await getRevisionsForProxyFromApigee(
            organizationName,
            proxy,
            options
          );

          if (!revisions || !Array.isArray(revisions)) {
            logError(
              `Something is wrong: Cannot fetch revisions for ${proxy} from apigee`
            );
            return;
          }

          revisions.map(async (revision) => {
            try {
              let isBackedUpInLocally = backedUpProxiesLocally[proxy]
                ? backedUpProxiesLocally[proxy].includes(revision)
                : false;

              if (isBackedUpInLocally) {
                logInfo(
                  `proxy ${proxy} with revision ${revision} is already backed up `
                );
                return;
              } else if (isBackedUpInLocally) {
                logInfo(
                  `proxy ${proxy} with revision ${revision} is already backed up locally`
                );
              }

              const data = await downloadRevisionForProxy(
                proxy,
                revision,
                organizationName,
                options.headers.Authorization
              );

              if (!data) {
                logError(
                  `Something went wrong: Could not fetch the revision ${revision} for proxy ${proxy}`
                );
                return;
              }

              const fileName = `${proxy}-revision-${revision}.zip`;

              if (!isBackedUpInLocally) {
                await saveProxyRevisionLocally(
                  localBackUpPath + "api proxies",
                  fileName,
                  data,
                  proxy,
                  revision
                );
              }
            } catch (error) {
              logError(error.message);
            }
          });
        } catch (error) {
          logError(error.message);
        }
      });
    } else if (!all && apiProxyName && apiProxyRevision) {
      const data = await downloadRevisionForProxy(
        apiProxyName,
        apiProxyRevision,
        organizationName,
        options.headers.Authorization
      );

      if (!data) {
        logError(
          `Something went wrong: Could not fetch the revision ${apiProxyRevision} for proxy ${apiProxyName}`
        );
        return;
      }

      const fileName = `${apiProxyName}-revision-${apiProxyRevision}.zip`;

      await saveProxyRevisionLocally(
        localBackUpPath + "api proxies",
        fileName,
        data,
        apiProxyName,
        apiProxyRevision
      );
    } else {
      throw Error(
        `specify --name and --revision option to backup specific api proxy revision or specify --all option`
      );
    }
  } catch (error) {
    logError(error.message);
  }
};

export default backUpApiProxy;
