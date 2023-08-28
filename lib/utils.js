import fs, { readFileSync } from "fs";
import path from "path";
import axios from "axios";

import { logError, logWarning, logSuccess, logInfo } from "./chalk.js";

////////////api proxy/////////////////////////////////////////////////////////////

const saveProxyRevisionLocally = async (
  localBackUpPath,
  fileName,
  fileData,
  proxy,
  revision
) => {
  // save locally
  if (!fs.existsSync(`${localBackUpPath}/${proxy}`)) {
    fs.mkdir(path.join(localBackUpPath, proxy), (err) => {
      if (err) {
        return logError(err);
      }
      logSuccess(`Directory ${proxy} created successfully!`);
      fs.writeFile(
        `${localBackUpPath}/${proxy}/${fileName}`,
        fileData,
        (err) => {
          if (err) throw err;

          logSuccess(
            `file ${fileName} saved to ${localBackUpPath} successfully`
          );
        }
      );
    });
  } else {
    fs.writeFile(
      `${localBackUpPath}/${proxy}/${fileName}`,
      fileData,
      async (err) => {
        if (err) throw err;

        logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
      }
    );
  }
};

const downloadRevisionForProxy = async (
  proxy,
  revision,
  orgName,
  authHeader
) => {
  try {
    const response = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apis/${proxy}/revisions/${revision}?format=bundle`,
      {
        headers: {
          Authorization: authHeader,
          Accept: "application/zip",
        },
        responseType: "arraybuffer",
      }
    );
    logSuccess(`Downloaded proxy- ${proxy} with revision- ${revision}`);
    return response.data;
  } catch (error) {
    logError(error.message);
  }
};

const getRevisionsForProxyFromApigee = async (orgName, proxyName, options) => {
  try {
    const response = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apis/${proxyName}/revisions`,
      options
    );

    return response.data;
  } catch (error) {
    logError(error.message);
  }
};

const getListOfAllApiProxiesFromApigee = async (orgName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apis`,
      options
    );
    if (!data.proxies) return [];

    return data.proxies.map((proxy) => proxy.name);
  } catch (error) {
    logError(error.message);
  }
};

const getProxyAndRevisionsStoredLocally = (localBackUpPath) => {
  const obj = {};
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  let proxies = fs
    .readdirSync(localBackUpPath, {
      withFileTypes: true,
    })
    .filter((content) => content.isDirectory())
    .map((dir) => {
      if (!obj[dir.name]) obj[dir.name] = [];
      return dir.name;
    });

  proxies.forEach((proxy) => {
    const files = fs
      .readdirSync(`${localBackUpPath}/${proxy}`, {
        withFileTypes: true,
      })
      .filter((c) => !c.isDirectory())
      .map((file) => file.name);

    files.forEach((file) => {
      const revision = file.split("-revision-")[1].split(".zip")[0];
      obj[proxy].push(revision);
    });
  });

  return obj;
};

///////////////////////////Shared Flows////////////////////////////////////////////////////////
const downloadRevisionForSharedFlow = async (
  sf,
  revision,
  orgName,
  authHeader
) => {
  try {
    const response = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows/${sf}/revisions/${revision}?format=bundle`,
      {
        headers: {
          Authorization: authHeader,
          Accept: "application/zip",
        },
        responseType: "arraybuffer",
      }
    );
    logSuccess(`Downloaded shared flow- ${sf} with revision- ${revision}`);
    return response.data;
  } catch (error) {
    logError(error.message);
  }
};

const saveSharedFlowRevisionLocally = async (
  localBackUpPath,
  fileName,
  fileData,
  sf,
  revision
) => {
  // save locally
  if (!fs.existsSync(`${localBackUpPath}/${sf}`)) {
    fs.mkdir(path.join(localBackUpPath, sf), (err) => {
      if (err) {
        return logError(err);
      }
      logSuccess(`Directory ${sf} created successfully!`);
      fs.writeFile(`${localBackUpPath}/${sf}/${fileName}`, fileData, (err) => {
        if (err) throw err;

        logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
      });
    });
  } else {
    fs.writeFile(
      `${localBackUpPath}/${sf}/${fileName}`,
      fileData,
      async (err) => {
        if (err) throw err;

        logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
      }
    );
  }
};

const getRevisionsForSharedFlowFromApigee = async (orgName, sf, options) => {
  try {
    const response = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows/${sf}/revisions`,
      options
    );

    return response.data;
  } catch (error) {
    logError(error.message);
  }
};

const getListOfAllSharedFlowsFromApigee = async (orgName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows`,
      options
    );

    if (!data.sharedFlows) return [];
    return data.sharedFlows.map((proxy) => proxy.name);
  } catch (error) {
    logError(error.message);
  }
};

const getSFAndRevisionsStoredLocally = (localBackUpPath) => {
  const obj = {};
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  let sharedFlows = fs
    .readdirSync(localBackUpPath, {
      withFileTypes: true,
    })
    .filter((content) => content.isDirectory())
    .map((dir) => {
      if (!obj[dir.name]) obj[dir.name] = [];
      return dir.name;
    });

  sharedFlows.forEach((sf) => {
    const files = fs
      .readdirSync(`${localBackUpPath}/${sf}`, {
        withFileTypes: true,
      })
      .filter((c) => !c.isDirectory())
      .map((file) => file.name);

    files.forEach((file) => {
      const revision = file.split("-revision-")[1].split(".zip")[0];
      obj[sf].push(revision);
    });
  });

  return obj;
};

///////////////////////////////Api products///////////////////////////////////////////
const getListOfApiProductsFromApigee = async (orgName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apiproducts`,
      options
    );

    if (!data.apiProduct) return [];

    return data.apiProduct.map((ap) => ap.name);
  } catch (error) {
    logError(error.message);
  }
};

const getApiProductConfigFromApigee = async (
  orgName,
  options,
  apiProductName
) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apiproducts/${apiProductName}`,
      options
    );

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const saveApiProductLocally = (localBackUpPath, fileName, fileData) => {
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  fs.writeFile(`${localBackUpPath}/${fileName}`, fileData, async (err) => {
    if (err) throw err;

    logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
  });
};

////////////////////////Developer Apps////////////////////////////////////////////////
const getListOfDevAppsFromApigee = async (orgName, devEmail, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/developers/${devEmail}/apps`,
      options
    );

    if (!data.app) return [];
    return data.app.map((a) => a.appId);
  } catch (error) {
    logError(error.message);
  }
};

const getDevAppConfigFromApigee = async (orgName, devEmail, appId, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/developers/${devEmail}/apps/${appId}`,
      options
    );

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const saveDevAppLocally = (localBackUpPath, fileName, fileData) => {
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  fs.writeFile(`${localBackUpPath}/${fileName}`, fileData, async (err) => {
    if (err) throw err;

    logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
  });
};

//////////////////////////Developers//////////////////////////////////////////////////
const getListOfDevsFromApigee = async (orgName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/developers`,
      options
    );

    if (!data.developer) return [];

    return data.developer.map((d) => d.email);
  } catch (error) {
    logError(error.message);
  }
};

const getDevConfigFromApigee = async (orgName, options, developer) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/developers/${developer}`,
      options
    );

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const saveDevsLocally = (localBackUpPath, fileName, fileData) => {
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  fs.writeFile(`${localBackUpPath}/${fileName}`, fileData, async (err) => {
    if (err) throw err;

    logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
  });
};

///////////////////////////target server////////////////////////////////////
const getListOfTargetServersFromApigee = async (orgName, envName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/environments/${envName}/targetservers`,
      options
    );

    if (!data) return [];

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const getTargetServerFromApigee = async (
  orgName,
  envName,
  targetServerName,
  options
) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/environments/${envName}/targetservers/${targetServerName}`,
      options
    );

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const saveTargetServerLocally = (localBackUpPath, fileName, fileData) => {
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  fs.writeFile(`${localBackUpPath}/${fileName}`, fileData, async (err) => {
    if (err) throw err;

    logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
  });
};

/////////////////////////////////////custom report////////////////////////////////////////
const getListOfCustomReportFromApigee = async (orgName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/reports`,
      options
    );

    if (!data) return [];

    return data.qualifier;
  } catch (error) {
    logError(error.message);
  }
};

const getCustomReportFromApigee = async (orgName, reportName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/reports/${reportName}`,
      options
    );

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const saveCustomReportLocally = (localBackUpPath, fileName, fileData) => {
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  fs.writeFile(`${localBackUpPath}/${fileName}`, fileData, async (err) => {
    if (err) throw err;

    logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
  });
};
///////////////////////////Flow hooks////////////////////////////////////
const getListOfFlowHooksFromApigee = async (orgName, envName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/wibmo-apigee-poc/environments/eval/flowhooks`,
      options
    );

    if (!data) return [];

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const getFlowHooksFromApigee = async (orgName, envName, fhName, options) => {
  try {
    const { data } = await axios.get(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/environments/${envName}/flowhooks/${fhName}`,
      options
    );

    return data;
  } catch (error) {
    logError(error.message);
  }
};

const saveFlowHooksLocally = (localBackUpPath, fileName, fileData) => {
  if (!fs.existsSync(`${localBackUpPath}`)) {
    fs.mkdirSync(localBackUpPath);
  }
  fs.writeFile(`${localBackUpPath}/${fileName}`, fileData, async (err) => {
    if (err) throw err;

    logSuccess(`file ${fileName} saved to ${localBackUpPath} successfully`);
  });
};

/////////////////////Environments///////////////////////////////////////////////////

const listEnvironments = async (orgName, options) => {
  try {
    const url = `https://apigee.googleapis.com/v1/organizations/${orgName}/environments`;

    const { data } = await axios.get(url, options);

    return data;
  } catch (error) {
    logError(error.message);
    return [];
  }
};

////////////////cli///////////////////////////
import { exec } from "child_process";
const gcloudLogin = () => {
  exec("gcloud auth application-default login");
};

////////////////config////////////////////////

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = `${__dirname}/../config.json`;

const getConfig = () => {
  try {
    const data = readFileSync(configPath);
    return JSON.parse(data);
  } catch (error) {
    logError(error.message);
    throw error;
  }
};

function setConfig(opts) {
  try {
    const { orgName, backupFolderPath } = opts;
    const newConfig = {
      organization: orgName,
      backupFolderPath,
    };

    fs.writeFileSync(configPath, JSON.stringify(newConfig));
    logSuccess(`configuration set successfully`);
  } catch (error) {
    logError(error.message);
  }
}

export {
  setConfig,
  getConfig,
  saveTargetServerLocally,
  getTargetServerFromApigee,
  getListOfTargetServersFromApigee,
  saveCustomReportLocally,
  getCustomReportFromApigee,
  getListOfCustomReportFromApigee,
  saveDevsLocally,
  getDevConfigFromApigee,
  getListOfDevsFromApigee,
  saveDevAppLocally,
  getDevAppConfigFromApigee,
  getListOfDevAppsFromApigee,
  saveApiProductLocally,
  getApiProductConfigFromApigee,
  getListOfApiProductsFromApigee,
  getSFAndRevisionsStoredLocally,
  getListOfAllSharedFlowsFromApigee,
  getRevisionsForSharedFlowFromApigee,
  saveSharedFlowRevisionLocally,
  downloadRevisionForSharedFlow,
  getProxyAndRevisionsStoredLocally,
  getListOfAllApiProxiesFromApigee,
  getRevisionsForProxyFromApigee,
  downloadRevisionForProxy,
  saveProxyRevisionLocally,
  getListOfFlowHooksFromApigee,
  getFlowHooksFromApigee,
  saveFlowHooksLocally,
  listEnvironments,
  gcloudLogin,
};
