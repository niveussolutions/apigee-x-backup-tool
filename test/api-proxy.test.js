import fs from 'fs';
import {
	saveProxyRevisionLocally,
	downloadRevisionForProxy,
	getRevisionsForProxyFromApigee,
	getProxyAndRevisionsStoredLocally,
	getListOfAllApiProxiesFromApigee,
} from '../lib/utils.js';
import { logError, logSuccess } from '../lib/chalk.js';
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

describe('saveProxyRevisionLocally', () => {
	const localBackUpPath = '/home/natesh/Documents/test-backup/api-proxy';
	const fileName = 'test-file.txt';
	const fileData = 'Hello, world!';
	const proxy = 'test-proxy';
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

		await saveProxyRevisionLocally(
			localBackUpPath,
			fileName,
			fileData,
			proxy,
			revision,
		);

		expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
		expect(fs.mkdir).toHaveBeenCalledWith(
			`${localBackUpPath}/${proxy}`,
			expect.any(Function),
		);

		expect(logSuccess).toHaveBeenCalledWith(
			`Directory ${proxy} created successfully!`,
		);
		expect(fs.writeFile).toHaveBeenCalledWith(
			`${localBackUpPath}/${proxy}/${fileName}`,
			fileData,
			expect.any(Function),
		);

		expect(logSuccess).toHaveBeenCalledWith(
			`file ${fileName} saved to ${localBackUpPath} successfully`,
		);
	});

	test('should save file when directory already exists', async () => {
		fs.existsSync.mockReturnValue(true);

		await saveProxyRevisionLocally(
			localBackUpPath,
			fileName,
			fileData,
			proxy,
			revision,
		);

		expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
		expect(fs.mkdir).not.toHaveBeenCalled();
		expect(fs.writeFile).toHaveBeenCalledWith(
			`${localBackUpPath}/${proxy}/${fileName}`,
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

		await saveProxyRevisionLocally(
			localBackUpPath,
			fileName,
			fileData,
			proxy,
			revision,
		);

		expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
		expect(fs.mkdir).toHaveBeenCalledWith(
			`${localBackUpPath}/${proxy}`,
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
			saveProxyRevisionLocally(
				localBackUpPath,
				fileName,
				fileData,
				proxy,
				revision,
			),
		).rejects.toThrow(error);

		expect(fs.existsSync).toHaveBeenCalledWith(`${localBackUpPath}/${proxy}`);
		expect(fs.mkdir).toHaveBeenCalledWith(
			`${localBackUpPath}/${proxy}`,
			expect.any(Function),
		);
		expect(logSuccess).toHaveBeenCalledTimes(1);
		expect(logSuccess).toHaveBeenCalledWith(
			`Directory ${proxy} created successfully!`,
		);
		expect(fs.writeFile).toHaveBeenCalledWith(
			`${localBackUpPath}/${proxy}/${fileName}`,
			fileData,
			expect.any(Function),
		);
	});
});

jest.mock('axios');

describe('downloadRevisionForProxy', () => {
	const proxy = 'test-proxy';
	const revision = '1';
	const orgName = 'test-org';
	const authHeader = 'Bearer test-auth-header';
	const responseData = 'mocked-response-data';
	const error = new Error('Test error');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should download proxy revision and return response data on success', async () => {
		axios.get.mockResolvedValueOnce({ data: responseData });

		const result = await downloadRevisionForProxy(
			proxy,
			revision,
			orgName,
			authHeader,
		);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis/${proxy}/revisions/${revision}?format=bundle`,
			{
				headers: {
					Authorization: authHeader,
					Accept: 'application/zip',
				},
				responseType: 'arraybuffer',
			},
		);
		expect(logSuccess).toHaveBeenCalledWith(
			`Downloaded proxy- ${proxy} with revision- ${revision}`,
		);
		expect(result).toBe(responseData);
	});

	test('should log error message on request failure', async () => {
		axios.get.mockRejectedValueOnce(error);

		await downloadRevisionForProxy(proxy, revision, orgName, authHeader);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis/${proxy}/revisions/${revision}?format=bundle`,
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

describe('getRevisionsForProxyFromApigee', () => {
	const orgName = 'test-org';
	const proxyName = 'test-proxy';
	const options = { headers: { Authorization: 'Bearer test-auth-header' } };
	const responseData = 'mocked-response-data';
	const error = new Error('Test error');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve revisions and return response data on success', async () => {
		axios.get.mockResolvedValueOnce({ data: responseData });

		const result = await getRevisionsForProxyFromApigee(
			orgName,
			proxyName,
			options,
		);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis/${proxyName}/revisions`,
			options,
		);
		expect(result).toBe(responseData);
	});

	test('should log error message on request failure', async () => {
		axios.get.mockRejectedValueOnce(error);

		await getRevisionsForProxyFromApigee(orgName, proxyName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis/${proxyName}/revisions`,
			options,
		);
		expect(logError).toHaveBeenCalledWith(error.message);
	});
});

describe('getListOfAllApiProxiesFromApigee', () => {
	const orgName = 'test-org';
	const options = { headers: { Authorization: 'test-auth-header' } };
	const responseData = {
		proxies: [{ name: 'proxy1' }, { name: 'proxy2' }, { name: 'proxy3' }],
	};
	const emptyResponseData = { proxies: [] };
	const error = new Error('Test error');

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should retrieve list of proxies from Apigee', async () => {
		axios.get.mockResolvedValueOnce({ data: responseData });

		const result = await getListOfAllApiProxiesFromApigee(orgName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis`,
			options,
		);
		expect(result).toEqual(['proxy1', 'proxy2', 'proxy3']);
	});

	test('should return an empty array if no proxies are present in the response', async () => {
		axios.get.mockResolvedValueOnce({ data: emptyResponseData });

		const result = await getListOfAllApiProxiesFromApigee(orgName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis`,
			options,
		);
		expect(result).toEqual([]);
	});

	test('should log error message on request failure', async () => {
		axios.get.mockRejectedValueOnce(error);

		await getListOfAllApiProxiesFromApigee(orgName, options);

		expect(axios.get).toHaveBeenCalledWith(
			`https://apigee.googleapis.com/v1/organizations/${orgName}/apis`,
			options,
		);
		expect(logError).toHaveBeenCalledWith(error.message);
	});
});

describe('getProxyAndRevisionsStoredLocally', () => {
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
				{ name: 'proxy1', isDirectory: () => true },
				{ name: 'proxy2', isDirectory: () => true },
				{ name: 'proxy3', isDirectory: () => true },
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

		getProxyAndRevisionsStoredLocally(localBackUpPath);

		expect(fs.existsSync).toHaveBeenCalledWith(localBackUpPath);
		expect(fs.mkdirSync).toHaveBeenCalledWith(localBackUpPath);
	});

	// Test Case 2: should read the proxy and revision information correctly
	test('should read the proxy and revision information correctly', () => {
		fs.existsSync.mockReturnValue(true);
		fs.readdirSync
			.mockReturnValueOnce([
				{ name: 'proxy1', isDirectory: () => true },
				{ name: 'proxy2', isDirectory: () => true },
				{ name: 'proxy3', isDirectory: () => true },
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

		const result = getProxyAndRevisionsStoredLocally(localBackUpPath);

		expect(fs.existsSync).toHaveBeenCalledWith(localBackUpPath);
		expect(fs.readdirSync).toHaveBeenNthCalledWith(1, localBackUpPath, {
			withFileTypes: true,
		});

		expect(fs.readdirSync).toHaveBeenNthCalledWith(
			2,
			localBackUpPath + '/proxy1',
			{
				withFileTypes: true,
			},
		);

		expect(fs.readdirSync).toHaveBeenNthCalledWith(
			3,
			localBackUpPath + '/proxy2',
			{
				withFileTypes: true,
			},
		);

		expect(fs.readdirSync).toHaveBeenNthCalledWith(
			4,
			localBackUpPath + '/proxy3',
			{
				withFileTypes: true,
			},
		);

		expect(result).toEqual({
			proxy1: ['1', '2'],
			proxy2: ['1', '2'],
			proxy3: ['1', '2', '3'],
		});
	});
});
