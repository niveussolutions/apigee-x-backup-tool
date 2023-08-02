// Import the necessary dependencies and the function to test
import backUpApiProxy from "../lib/api-proxy.js"; // Replace with the correct path to your module
import { logError, logWarning, logSuccess, logInfo } from "../lib/chalk.js";
import {
  getProxyAndRevisionsStoredLocally,
  getListOfAllApiProxiesFromApigee,
  getRevisionsForProxyFromApigee,
  downloadRevisionForProxy,
  saveProxyRevisionLocally,
  getConfig,
} from "../lib/utils.js";
// Mock the dependencies or provide any necessary test data
jest.mock("google-auth-library");
jest.mock("../lib/utils", () => ({
  getListOfAllApiProxiesFromApigee: jest
    .fn()
    .mockResolvedValue(["proxy1", "proxy2"]),
  getRevisionsForProxyFromApigee: jest.fn().mockResolvedValue([1, 2, 3]),
  downloadRevisionForProxy: jest.fn().mockResolvedValue("mocked_data"),
  saveProxyRevisionLocally: jest.fn(),
  getConfig: jest.fn().mockReturnValue({
    organization: "your_organization",
    backupFolderPath: "/path/to/backup/folder/",
  }),
}));
jest.mock("../lib/chalk", () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
  logSuccess: jest.fn(),
  logInfo: jest.fn(),
}));

describe("backUpApiProxy", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should backup all API proxies", async () => {
    await backUpApiProxy(true);

    // Verify that the necessary functions are called with the correct arguments
    expect(getListOfAllApiProxiesFromApigee).toHaveBeenCalledWith(
      "your_organization",
      expect.any(Object)
    );
    // expect(getRevisionsForProxyFromApigee).toHaveBeenCalledTimes(2);
    // expect(downloadRevisionForProxy).toHaveBeenCalledTimes(6);
    // expect(saveProxyRevisionLocally).toHaveBeenCalledTimes(6);
  });

  test("should backup a specific API proxy revision", async () => {
    await backUpApiProxy(false, "proxy1", 1);

    // Verify that the necessary functions are called with the correct arguments
    expect(downloadRevisionForProxy).toHaveBeenCalledWith(
      "proxy1",
      1,
      "your_organization",
      expect.any(String)
    );
    expect(saveProxyRevisionLocally).toHaveBeenCalledWith(
      "/path/to/backup/folder/api proxies",
      "proxy1-revision-1.zip",
      "mocked_data",
      "proxy1",
      1
    );
  });

  test("should throw an error when missing parameters", async () => {
    await backUpApiProxy();

    // Verify that the error message is logged
    expect(logError).toHaveBeenCalledWith(
      "specify --name and --revision option to backup specific api proxy revision or specify --all option"
    );
  });
});
