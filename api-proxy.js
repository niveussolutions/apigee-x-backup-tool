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

//uncomment the below code to enable backup to cloud storage  and use the name of a bucket u created on cloud storage

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath;
const prefix = "api proxies/";
const delimeter = "/";

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

    // uncomment the below code to enable backup to cloud storage
    // const backedUpProxyDetailsFromStorage =
    //   await getProxyAndRevisionsStoredInStorage(
    //     {
    //       prefix,
    //       delimeter,
    //     },
    //     bucket
    //   );

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

          await Promise.all(
            revisions.map(async (revision) => {
              try {
                // uncomment the below code to enable backup to cloud storage
                // let isBackedUpInStorage = backedUpProxyDetailsFromStorage[proxy]
                //   ? backedUpProxyDetailsFromStorage[proxy].includes(revision)
                //   : false;

                let isBackedUpInLocally = backedUpProxiesLocally[proxy]
                  ? backedUpProxiesLocally[proxy].includes(revision)
                  : false;

                //uncomment isBackedUpInStorage && in if to enable backup to cloud storage
                if (
                  // isBackedUpInStorage &&
                  isBackedUpInLocally
                ) {
                  console.log(
                    `proxy ${proxy} with revision ${revision} is already backed up `
                  );
                  return;
                } else if (isBackedUpInLocally) {
                  console.log(
                    `proxy ${proxy} with revision ${revision} is already backed up locally`
                  );
                }
                // else if (isBackedUpInStorage) {
                //   console.log(
                //     `proxy ${proxy} with revision ${revision} is already backed up in cloud storage`
                //   );
                // }

                const data = await downloadRevisionForProxy(
                  proxy,
                  revision,
                  organizationName,
                  options.headers.Authorization
                );

                const fileName = `${proxy}-revision-${revision}.zip`;

                if (data) {
                  //uncomment the below code to enable backup to cloud storage
                  // if (!isBackedUpInStorage) {
                  //   await uploadToCloudStorage(
                  //     proxy,
                  //     revision,
                  //     fileName,
                  //     data,
                  //     bucket,
                  //     prefix
                  //   );
                  // }

                  if (!isBackedUpInLocally) {
                    await saveProxyRevisionLocally(
                      localBackUpPath + "api proxies",
                      fileName,
                      data,
                      proxy,
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

module.exports = backUpApiProxy;
