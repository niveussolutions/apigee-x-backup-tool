/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

const { GoogleAuth } = require("google-auth-library");
const auth = new GoogleAuth();
const {
  getApiProductConfigFromApigee,
  getListOfApiProductsFromApigee,

  saveApiProductLocally,
} = require("./utils.js");
const config = require("./config.js");

const organizationName = config.organization;
const localBackUpPath = config.localBackUp.basePath + "api product";
const prefix = "api proxies/";
const delimeter = "/";

const backUpApiProduct = async () => {
  try {
    const authToken = await auth.getAccessToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const apiProductsInApigee = await getListOfApiProductsFromApigee(
      organizationName,
      options
    );

    await Promise.all(
      apiProductsInApigee.map(async (product) => {
        const apiProduct = await getApiProductConfigFromApigee(
          organizationName,
          options,
          product
        );
        const fileName = `${product}.json`;
        saveApiProductLocally(
          localBackUpPath,
          fileName,
          JSON.stringify(apiProduct)
        );
      })
    );
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpApiProduct;
