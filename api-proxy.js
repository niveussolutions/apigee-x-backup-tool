/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  getProxyAndRevisionsStoredLocally,
  getListOfAllApiProxiesFromApigee,
  getRevisionsForProxyFromApigee,
  downloadRevisionForProxy,

  saveProxyRevisionLocally,
} = require("./utils.js");
const config = require("./config.js");

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath;

const backUpApiProxy = async () => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const proxiesFromApigee = await getListOfAllApiProxiesFromApigee(
      organizationName,
      options
    );

    if (!proxiesFromApigee || !Array.isArray(proxiesFromApigee)) {
      console.log(
        "Something went wrong: Could not fetch  Api proxies from Apigee"
      );
      return;
    } else if (
      Array.isArray(proxiesFromApigee) &&
      proxiesFromApigee.length === 0
    ) {
      console.log("No Api proxies found");
      return;
    }

    const backedUpProxiesLocally = getProxyAndRevisionsStoredLocally(
      localBackUpPath + "api proxies"
    );

    await Promise.all(
      proxiesFromApigee.map(async (proxy) => {
        try {
          const revisions = await getRevisionsForProxyFromApigee(
            organizationName,
            proxy,
            options
          );

          if (!revisions || !Array.isArray(revisions)) {
            console.log(
              `Something is wrong: Cannot fetch revisions for ${proxy} from apigee`
            );
            return;
          }

          await Promise.all(
            revisions.map(async (revision) => {
              try {
                let isBackedUpInLocally = backedUpProxiesLocally[proxy]
                  ? backedUpProxiesLocally[proxy].includes(revision)
                  : false;

                if (isBackedUpInLocally) {
                  console.log(
                    `proxy ${proxy} with revision ${revision} is already backed up `
                  );
                  return;
                } else if (isBackedUpInLocally) {
                  console.log(
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
                  console.log(
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

module.exports = backUpApiProxy;
