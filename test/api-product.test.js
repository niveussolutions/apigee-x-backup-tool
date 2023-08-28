import { logError, logSuccess } from "../lib/chalk";
import {
  getApiProductConfigFromApigee,
  getListOfApiProductsFromApigee,
  saveApiProductLocally,
} from "../lib/utils";

import axios from "axios";
import fs from "fs";
// Mock the fs module functions
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readdirSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock("../lib/chalk.js", () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
  logSuccess: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock("axios");

const orgName = "test-org";
const authHeader = "Bearer test-auth-header";
const options = {
  headers: {
    Authorization: authHeader,
    Accept: "application/json",
  },
};
const error = new Error("Test error");

describe("getListOfApiProductsFromApigee", () => {
  test("call apigee api using axios with url and headers", async () => {
    const data = await getListOfApiProductsFromApigee(orgName, options);

    expect(axios.get).toHaveBeenCalledWith(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apiproducts`,
      options
    );
  });

  test("get list of product names from apigee", async () => {
    const responseDate = {
      apiProduct: [{ name: "product1" }, { name: "product2" }],
    };
    axios.get.mockResolvedValueOnce({ data: responseDate });
    const data = await getListOfApiProductsFromApigee(orgName, options);
    expect(data).toEqual(["product1", "product2"]);
  });

  test("return empty array if there are no api products", async () => {
    const emptyData = {};
    axios.get.mockResolvedValueOnce({ data: emptyData });
    const data = await getListOfApiProductsFromApigee(orgName, options);
    expect(data).toEqual([]);
  });

  test("call logError with error message as argument in case of any error", async () => {
    axios.get.mockRejectedValueOnce(error);
    await getListOfApiProductsFromApigee(orgName, options);
    expect(logError).toHaveBeenCalledWith(error.message);
  });
});

describe("getApiProductConfigFromApigee", () => {
  const apiProductName = "api-product-1";
  test("Call apigee api to fetch an api product with an url and options", async () => {
    const promise = getApiProductConfigFromApigee(
      orgName,
      options,
      apiProductName
    );

    expect(axios.get).toHaveBeenCalledWith(
      `https://apigee.googleapis.com/v1/organizations/${orgName}/apiproducts/${apiProductName}`,
      options
    );
    await expect(promise).resolves.toEqual(undefined);
  });

  test("call logError with error message as argument in case of any error", async () => {
    axios.get.mockRejectedValueOnce(error);
    await getApiProductConfigFromApigee(orgName, options);
    expect(logError).toHaveBeenCalledWith(error.message);
  });
});

describe("saveApiProductLocally", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const localBackUpPath = "/home/natesh/Documents/test-backup/api-product";
  const fileName = "test-file.json";
  const fileData = "Hello, world!";
  const error1 = new Error("testing");

  test("create folder if does not exists", async () => {
    fs.existsSync.mockReturnValue(false);
    saveApiProductLocally(localBackUpPath, fileName, fileData);
    expect(fs.mkdirSync).toHaveBeenCalledWith(localBackUpPath);
  });

  test("Write file to backup folder", async () => {
    fs.writeFile.mockImplementation((filePath, data, callback) =>
      callback(null)
    );
    fs.existsSync.mockReturnValue(true);

    saveApiProductLocally(localBackUpPath, fileName, fileData);

    expect(fs.writeFile).toHaveBeenCalledWith(
      `${localBackUpPath}/${fileName}`,
      fileData,
      expect.any(Function)
    );
    expect(logSuccess).toHaveBeenCalledWith(
      `file ${fileName} saved to ${localBackUpPath} successfully`
    );
  });

  // test("throw error if writeFile fails", () => {
  //   const mockError = new Error("File write error");
  //   fs.existsSync.mockReturnValue(true);
  //   fs.writeFile.mockImplementation((path, data, callback) =>
  //     callback(mockError)
  //   );

  //   expect(() =>
  //     saveApiProductLocally(localBackUpPath, fileName, fileData)
  //   ).toThrow(mockError);

  //   expect(fs.existsSync).toHaveBeenCalledWith(localBackUpPath);

  //   expect(fs.writeFile).toHaveBeenCalledWith(
  //     `${localBackUpPath}/${fileName}`,
  //     fileData,
  //     expect.any(Function)
  //   );
  // });
});
