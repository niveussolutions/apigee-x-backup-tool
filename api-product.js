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

    if (!apiProductsInApigee || !Array.isArray(apiProductsInApigee)) {
      console.log(
        "Something went wrong: Could not fetch Api products from Apigee"
      );
      return;
    } else if (
      Array.isArray(apiProductsInApigee) &&
      apiProductsInApigee.length === 0
    ) {
      console.log("No Api products found");
      return;
    }

    apiProductsInApigee.map(async (product) => {
      const apiProduct = await getApiProductConfigFromApigee(
        organizationName,
        options,
        product
      );
      if (!apiProduct) {
        console.log(
          `Something went wrong: Could not fetch Api Product-${product} from Apigee`
        );
        return;
      }
      const fileName = `${product}.json`;
      saveApiProductLocally(
        localBackUpPath,
        fileName,
        JSON.stringify(apiProduct)
      );
    });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = backUpApiProduct;
