import fs from "fs";
import { saveProxyRevisionLocally } from "../lib/utils.js";
import { logError, logWarning, logSuccess, logInfo } from "../lib/chalk.js";

// Mock the fs module functions
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

// Mock the chalk.js module functions
jest.mock("../lib/chalk.js", () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
  logSuccess: jest.fn(),
  logInfo: jest.fn(),
}));

describe("saveProxyRevisionLocally", () => {
  const localBackUpPath = "/home/natesh/Documents/test-backup/api-proxy";
  const fileName = "test-file.txt";
  const fileData = "Hello, world!";
  const proxy = "test-proxy";
  const revision = "1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  fs.mkdir.mockImplementation((dirPath, callback) => callback());
  fs.writeFile.mockImplementation((filePath, data, callback) => {
    // Simulate a successful write by calling the callback without any error
    callback();
  });

  test("should create directory and save file when directory does not exist", async () => {
    fs.existsSync.mockReturnValue(false);

    await saveProxyRevisionLocally(
      localBackUpPath,
      fileName,
      fileData,
      proxy,
      revision
    );

    expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
    expect(fs.mkdir).toHaveBeenCalledWith(
      `${localBackUpPath}/${proxy}`,
      expect.any(Function)
    );

    expect(logSuccess).toHaveBeenCalledWith(
      `Directory ${proxy} created successfully!`
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      `${localBackUpPath}/${proxy}/${fileName}`,
      fileData,
      expect.any(Function)
    );

    expect(logSuccess).toHaveBeenCalledWith(
      `file ${fileName} saved to ${localBackUpPath} successfully`
    );
  });

  test("should save file when directory already exists", async () => {
    fs.existsSync.mockReturnValue(true);

    await saveProxyRevisionLocally(
      localBackUpPath,
      fileName,
      fileData,
      proxy,
      revision
    );

    expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      `${localBackUpPath}/${proxy}/${fileName}`,
      fileData,
      expect.any(Function)
    );
    expect(logSuccess).toHaveBeenCalledWith(
      `file ${fileName} saved to ${localBackUpPath} successfully`
    );
  });

  test("should log error when mkdir fails", async () => {
    const error = new Error("Failed to create directory");
    fs.existsSync.mockReturnValue(false);
    fs.mkdir.mockImplementation((dirPath, callback) => callback(error));

    await saveProxyRevisionLocally(
      localBackUpPath,
      fileName,
      fileData,
      proxy,
      revision
    );

    expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
    expect(fs.mkdir).toHaveBeenCalledWith(
      `${localBackUpPath}/${proxy}`,
      expect.any(Function)
    );
    expect(logError).toHaveBeenCalledWith(error);
    expect(fs.writeFile).not.toHaveBeenCalled();
    expect(logSuccess).not.toHaveBeenCalled();
  });

  test("should throw error when writeFile fails", async () => {
    const error = new Error("Failed to write file");
    fs.existsSync.mockReturnValue(false);
    fs.mkdir.mockImplementation((dirPath, callback) => callback());
    fs.writeFile.mockImplementation((filePath, data, callback) =>
      callback(error)
    );

    await expect(
      saveProxyRevisionLocally(
        localBackUpPath,
        fileName,
        fileData,
        proxy,
        revision
      )
    ).rejects.toThrow(error);

    expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
    expect(fs.mkdir).toHaveBeenCalledWith(
      `${localBackUpPath}/${proxy}`,
      expect.any(Function)
    );
    expect(logSuccess).toHaveBeenCalledTimes(1);
    expect(logSuccess).toHaveBeenCalledWith(
      `Directory ${proxy} created successfully!`
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      `${localBackUpPath}/${proxy}/${fileName}`,
      fileData,
      expect.any(Function)
    );
  });
});
