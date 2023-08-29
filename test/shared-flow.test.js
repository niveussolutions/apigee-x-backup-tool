import fs from 'fs';
import {
	getSFAndRevisionsStoredLocally,
	getListOfAllSharedFlowsFromApigee,
	getRevisionsForSharedFlowFromApigee,
	saveSharedFlowRevisionLocally,
	downloadRevisionForSharedFlow,
} from '../lib/utils.js';
import { logError, logWarning, logSuccess, logInfo } from '../lib/chalk.js';
import axios from 'axios';

// Mock the fs module functions
jest.mock('fs', () => ({
	existsSync: jest.fn(),
	mkdir: jest.fn(),
	writeFile: jest.fn(),
	readdirSync: jest.fn(),
	mkdirSync: jest.fn(),
}));

// Mock the chalk.js module functions
jest.mock('../lib/chalk.js', () => ({
	logError: jest.fn(),
	logWarning: jest.fn(),
	logSuccess: jest.fn(),
	logInfo: jest.fn(),
}));

describe('saveSharedFlowRevisionLocally', () => {
	const localBackUpPath = '/home/natesh/Documents/test-backup/shared-flow';
	const fileName = 'test-file.txt';
	const fileData = 'Hello, world!';
	const sharedFlow = 'test-shared-flow';
	const revision = '1';

	afterEach(() => {
		jest.clearAllMocks();
	});

	fs.mkdir.mockImplementation((dirPath, callback) => callback());
	fs.writeFile.mockImplementation((filePath, data, callback) => {
		// Simulate a successful write by calling the callback without any error
		callback();
	});

	test('should create directory and save file when directory does not exist', async () => {
		fs.existsSync.mockReturnValue(false);

		await saveSharedFlowRevisionLocally(
			localBackUpPath,
			fileName,
			fileData,
			sharedFlow,
			revision,
		);

		expect(fs.existsSync).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
		);
		expect(fs.mkdir).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
			expect.any(Function),
		);

		expect(logSuccess).toHaveBeenCalledWith(
			`Directory ${sharedFlow} created successfully!`,
		);
		expect(fs.writeFile).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}/${fileName}`,
			fileData,
			expect.any(Function),
		);

		expect(logSuccess).toHaveBeenCalledWith(
			`file ${fileName} saved to ${localBackUpPath} successfully`,
		);
	});

	test('should save file when directory already exists', async () => {
		fs.existsSync.mockReturnValue(true);

		await saveSharedFlowRevisionLocally(
			localBackUpPath,
			fileName,
			fileData,
			sharedFlow,
			revision,
		);

		expect(fs.existsSync).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
		);
		expect(fs.mkdir).not.toHaveBeenCalled();
		expect(fs.writeFile).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}/${fileName}`,
			fileData,
			expect.any(Function),
		);
		expect(logSuccess).toHaveBeenCalledWith(
			`file ${fileName} saved to ${localBackUpPath} successfully`,
		);
	});

	test('should log error when mkdir fails', async () => {
		const error = new Error('Failed to create directory');
		fs.existsSync.mockReturnValue(false);
		fs.mkdir.mockImplementation((dirPath, callback) => callback(error));

		await saveSharedFlowRevisionLocally(
			localBackUpPath,
			fileName,
			fileData,
			sharedFlow,
			revision,
		);

		expect(fs.existsSync).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
		);
		expect(fs.mkdir).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
			expect.any(Function),
		);
		expect(logError).toHaveBeenCalledWith(error);
		expect(fs.writeFile).not.toHaveBeenCalled();
		expect(logSuccess).not.toHaveBeenCalled();
	});

	test('should throw error when writeFile fails', async () => {
		const error = new Error('Failed to write file');
		fs.existsSync.mockReturnValue(false);
		fs.mkdir.mockImplementation((dirPath, callback) => callback());
		fs.writeFile.mockImplementation((filePath, data, callback) =>
			callback(error),
		);

		await expect(
			saveSharedFlowRevisionLocally(
				localBackUpPath,
				fileName,
				fileData,
				sharedFlow,
				revision,
			),
		).rejects.toThrow(error);

		expect(fs.existsSync).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
		);
		expect(fs.mkdir).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}`,
			expect.any(Function),
		);
		expect(logSuccess).toHaveBeenCalledTimes(1);
		expect(logSuccess).toHaveBeenCalledWith(
			`Directory ${sharedFlow} created successfully!`,
		);
		expect(fs.writeFile).toHaveBeenCalledWith(
			`${localBackUpPath}/${sharedFlow}/${fileName}`,
			fileData,
			expect.any(Function),
		);
	});
});

jest.mock('axios');

describe('downloadRevisionForsharedFlow', () => {
	const sharedFlow = 'test-sharedFlow';
	const revision = '1';
	const orgName = 'test-org';
	const authHeader = 'Bearer test-auth-header';
	const responseData = 'mocked-response-data';
	const error = new Error('Test error');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should download sharedFlow revision and return response data on success', async () => {
		axios.get.mockResolvedValueOnce({ data: responseData });

		const result = await downloadRevisionForSharedFlow(
			sharedFlow,
			revision,
			orgName,
			authHeader,
		);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows/${sharedFlow}/revisions/${revision}?format=bundle`,
			{
				headers: {
					Authorization: authHeader,
					Accept: 'application/zip',
				},
				responseType: 'arraybuffer',
			},
		);
		expect(logSuccess).toHaveBeenCalledWith(
			`Downloaded shared flow- ${sharedFlow} with revision- ${revision}`,
		);
		expect(result).toBe(responseData);
	});

	test('should log error message on request failure', async () => {
		axios.get.mockRejectedValueOnce(error);

		await downloadRevisionForSharedFlow(
			sharedFlow,
			revision,
			orgName,
			authHeader,
		);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows/${sharedFlow}/revisions/${revision}?format=bundle`,
			{
				headers: {
					Authorization: authHeader,
					Accept: 'application/zip',
				},
				responseType: 'arraybuffer',
			},
		);
		expect(logError).toHaveBeenCalledWith(error.message);
	});
});

describe('getRevisionsForsharedFlowFromApigee', () => {
	const orgName = 'test-org';
	const sharedFlowName = 'test-sharedFlow';
	const options = { headers: { Authorization: 'Bearer test-auth-header' } };
	const responseData = 'mocked-response-data';
	const error = new Error('Test error');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve revisions and return response data on success', async () => {
		axios.get.mockResolvedValueOnce({ data: responseData });

		const result = await getRevisionsForSharedFlowFromApigee(
			orgName,
			sharedFlowName,
			options,
		);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows/${sharedFlowName}/revisions`,
			options,
		);
		expect(result).toBe(responseData);
	});

	test('should log error message on request failure', async () => {
		axios.get.mockRejectedValueOnce(error);

		await getRevisionsForSharedFlowFromApigee(orgName, sharedFlowName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows/${sharedFlowName}/revisions`,
			options,
		);
		expect(logError).toHaveBeenCalledWith(error.message);
	});
});

describe('getListOfAllSharedFlowsFromApigee', () => {
	const orgName = 'test-org';
	const options = { headers: { Authorization: 'test-auth-header' } };
	const responseData = {
		sharedFlows: [
			{ name: 'sharedFlow1' },
			{ name: 'sharedFlow2' },
			{ name: 'sharedFlow3' },
		],
	};

	const emptyResponseData = {};
	const error = new Error('Test error');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve list of shared flows from Apigee', async () => {
		axios.get.mockResolvedValueOnce({ data: responseData });

		const result = await getListOfAllSharedFlowsFromApigee(orgName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows`,
			options,
		);
		expect(result).toEqual(['sharedFlow1', 'sharedFlow2', 'sharedFlow3']);
	});

	test('should return an empty array if no shared flows are present in the response', async () => {
		axios.get.mockResolvedValueOnce({ data: emptyResponseData });

		const result = await getListOfAllSharedFlowsFromApigee(orgName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows`,
			options,
		);
		expect(result).toEqual([]);
	});

	test('should log error message on request failure', async () => {
		axios.get.mockRejectedValueOnce(error);

		await getListOfAllSharedFlowsFromApigee(orgName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/sharedflows`,
			options,
		);
		expect(logError).toHaveBeenCalledWith(error.message);
	});
});

describe('getSFAndRevisionsStoredLocally', () => {
	const localBackUpPath = '/path/to/backups';
	beforeEach(() => {
		fs.existsSync.mockReset();
		fs.mkdirSync.mockReset();
		fs.readdirSync.mockReset();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should create the local backup directory if it does not exist', () => {
		fs.existsSync.mockReturnValue(false);
		fs.readdirSync
			.mockReturnValueOnce([
				{ name: 'sharedFlow1', isDirectory: () => true },
				{ name: 'sharedFlow2', isDirectory: () => true },
				{ name: 'sharedFlow3', isDirectory: () => true },
			])
			.mockReturnValueOnce([
				{ name: 'file1-revision-1.zip', isDirectory: () => false },
				{ name: 'file1-revision-2.zip', isDirectory: () => false },
			])
			.mockReturnValueOnce([
				{ name: 'file2-revision-1.zip', isDirectory: () => false },
				{ name: 'file2-revision-2.zip', isDirectory: () => false },
			])
			.mockReturnValue([
				{ name: 'file3-revision-1.zip', isDirectory: () => false },
				{ name: 'file3-revision-2.zip', isDirectory: () => false },
				{ name: 'file3-revision-3.zip', isDirectory: () => false },
			]);

		const result = getSFAndRevisionsStoredLocally(localBackUpPath);

		expect(fs.existsSync).toHaveBeenCalledWith(localBackUpPath);
		expect(fs.mkdirSync).toHaveBeenCalledWith(localBackUpPath);
	});

	// Test Case 2: should read the sharedFlow and revision information correctly
	test('should read the sharedFlow and revision information correctly', () => {
		fs.existsSync.mockReturnValue(true);
		fs.readdirSync
			.mockReturnValueOnce([
				{ name: 'sharedFlow1', isDirectory: () => true },
				{ name: 'sharedFlow2', isDirectory: () => true },
				{ name: 'sharedFlow3', isDirectory: () => true },
			])
			.mockReturnValueOnce([
				{ name: 'file1-revision-1.zip', isDirectory: () => false },
				{ name: 'file1-revision-2.zip', isDirectory: () => false },
			])
			.mockReturnValueOnce([
				{ name: 'file2-revision-1.zip', isDirectory: () => false },
				{ name: 'file2-revision-2.zip', isDirectory: () => false },
			])
			.mockReturnValue([
				{ name: 'file3-revision-1.zip', isDirectory: () => false },
				{ name: 'file3-revision-2.zip', isDirectory: () => false },
				{ name: 'file3-revision-3.zip', isDirectory: () => false },
			]);

		const result = getSFAndRevisionsStoredLocally(localBackUpPath);

		expect(fs.existsSync).toHaveBeenCalledWith(localBackUpPath);
		expect(fs.readdirSync).toHaveBeenNthCalledWith(1, localBackUpPath, {
			withFileTypes: true,
		});

		expect(fs.readdirSync).toHaveBeenNthCalledWith(
			2,
			localBackUpPath + '/sharedFlow1',
			{
				withFileTypes: true,
			},
		);

		expect(fs.readdirSync).toHaveBeenNthCalledWith(
			3,
			localBackUpPath + '/sharedFlow2',
			{
				withFileTypes: true,
			},
		);

		expect(fs.readdirSync).toHaveBeenNthCalledWith(
			4,
			localBackUpPath + '/sharedFlow3',
			{
				withFileTypes: true,
			},
		);

		expect(result).toEqual({
			sharedFlow1: ['1', '2'],
			sharedFlow2: ['1', '2'],
			sharedFlow3: ['1', '2', '3'],
		});
	});
});
