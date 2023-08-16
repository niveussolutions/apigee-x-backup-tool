// apigeeFunctions.test.js
import { logError, logSuccess } from "../lib/chalk";
import axios from "axios";
import fs from "fs";
import {
  getListOfTargetServersFromApigee,
  getTargetServerFromApigee,
  saveTargetServerLocally,
} from "../lib/utils.js";

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

// Mocking the options object for axios
const mockOptions = { headers: { Authorization: "Bearer YOUR_ACCESS_TOKEN" } };

describe("getListOfTargetServersFromApigee", () => {
  test("should return an array of target servers when data is available", async () => {
    const mockResponse = {
      data: ["target1", "target2"],
    };

    axios.get.mockResolvedValue(mockResponse);

    const result = await getListOfTargetServersFromApigee(
      "orgName",
      "test-env",
      mockOptions
    );

    expect(result).toEqual(["target1", "target2"]);
  });

  test("should return an empty array when no data is available", async () => {
    const mockResponse = { data: [] };
    axios.get.mockResolvedValue(mockResponse);

    const result = await getListOfTargetServersFromApigee(
      "orgName",
      "test-env",
      mockOptions
    );

    expect(result).toEqual([]);
  });

  test("should log an error when an error occurs", async () => {
    const errorMessage = "Failed to fetch data";
    axios.get.mockRejectedValue(new Error(errorMessage));

    await getListOfTargetServersFromApigee("orgName", "test-env", mockOptions);

    expect(logError).toHaveBeenCalledWith(errorMessage);
  });
});

describe("getTargetServerFromApigee", () => {
  test("should return application data when successful", async () => {
    const mockResponse = { data: { key: "value" } };
    axios.get.mockResolvedValue(mockResponse);

    const result = await getTargetServerFromApigee(
      "orgName",
      "test-env",
      "test-target-server",
      mockOptions
    );

    expect(result).toEqual(mockResponse.data);
  });

  test("should log an error when an error occurs", async () => {
    const errorMessage = "Failed to fetch data";
    axios.get.mockRejectedValue(new Error(errorMessage));

    await getTargetServerFromApigee(
      "orgName",
      "test-env",
      "test-target-server",
      mockOptions
    );

    expect(logError).toHaveBeenCalledWith(errorMessage);
  });
});

describe("saveDevAppLocally", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should create a directory and save the file", () => {
    const mockLocalPath = "mock/local/path";
    const mockFileName = "mockFile.json";
    const mockFileData = '{ "key": "value" }';

    fs.existsSync.mockReturnValue(false);

    saveTargetServerLocally(mockLocalPath, mockFileName, mockFileData);

    expect(fs.existsSync).toHaveBeenCalledWith(mockLocalPath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(mockLocalPath);
    expect(fs.writeFile).toHaveBeenCalledWith(
      `${mockLocalPath}/${mockFileName}`,
      mockFileData,
      expect.any(Function)
    );
    // You might also want to assert that mockLogSuccess was called
  });

  test("should save the file without creating a directory", () => {
    const mockLocalPath = "mock/local/path";
    const mockFileName = "mockFile.json";
    const mockFileData = '{ "key": "value" }';

    fs.existsSync.mockReturnValue(true);

    saveTargetServerLocally(mockLocalPath, mockFileName, mockFileData);

    expect(fs.existsSync).toHaveBeenCalledWith(mockLocalPath);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      `${mockLocalPath}/${mockFileName}`,
      mockFileData,
      expect.any(Function)
    );
    // You might also want to assert that mockLogSuccess was called
  });

  //   test("should throw an error during file write", () => {
  //     const mockLocalPath = "mock/local/path";
  //     const mockFileName = "mockFile.json";
  //     const mockFileData = '{ "key": "value" }';
  //     const mockError = new Error("File write error");

  //     fs.existsSync.mockReturnValue(false);
  //     fs.mkdirSync.mockImplementation(() => {});
  //     fs.writeFile.mockImplementation((path, data, callback) =>
  //       callback(mockError)
  //     );

  //     expect(() => {
  //       saveTargetServerLocally(mockLocalPath, mockFileName, mockFileData);
  //     }).toThrow(mockError);
  //   });
});
