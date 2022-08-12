/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from "google-auth-library";
const auth = new GoogleAuth();
import {
  getApiProductConfigFromApigee,
  getListOfApiProductsFromApigee,
  saveApiProductLocally,
} from "./utils.js";
import config from "./config.js";
import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

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
      logError(
        "Something went wrong: Could not fetch Api products from Apigee"
      );
      return;
    } else if (
      Array.isArray(apiProductsInApigee) &&
      apiProductsInApigee.length === 0
    ) {
      logInfo("No Api products found");
      return;
    }

    apiProductsInApigee.map(async (product) => {
      const apiProduct = await getApiProductConfigFromApigee(
        organizationName,
        options,
        product
      );
      if (!apiProduct) {
        logError(
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
    logError(error.message);
  }
};

export default backUpApiProduct;
