import { logSuccess } from '../lib/chalk';
import fs from 'fs';
import { getConfig, setConfig } from '../lib/utils.js';

jest.mock('fs', () => ({
	existsSync: jest.fn(),
	mkdir: jest.fn(),
	writeFile: jest.fn(),
	readdirSync: jest.fn(),
	mkdirSync: jest.fn(),
	writeFileSync: jest.fn(),
	readFileSync: jest.fn(),
	unlinkSync: jest.fn(),
}));

jest.mock('../lib/chalk.js', () => ({
	logError: jest.fn(),
	logWarning: jest.fn(),
	logSuccess: jest.fn(),
	logInfo: jest.fn(),
}));

jest.mock('axios');

describe('getConfig', () => {
	test('should return valid configuration data', () => {
		// Create a mock configuration file for testing
		const mockConfig = {
			organization: 'testOrg',
			backupFolderPath: '/test/backup',
		};
		fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

		// Call the getConfig function
		const config = getConfig();

		// Assert that the returned configuration matches the mock configuration
		expect(config).toEqual(mockConfig);
	});

	//   test("should throw an error if the configuration file is missing", () => {
	//     // Call getConfig and expect it to throw an error
	//     expect(() => getConfig()).toThrow();
	//   });
});

describe('setConfig', () => {
	test('should set the configuration successfully', () => {
		// Define mock input
		const mockOpts = {
			orgName: 'testOrg',
			backupFolderPath: '/test/backup',
		};

		// Call the setConfig function
		setConfig(mockOpts);

		// Check if the configuration file was written with the expected content
		// expect(fs.writeFileSync).toHaveBeenCalledWith(
		//   configPath,
		//   JSON.stringify({
		//     organization: mockOpts.orgName,
		//     backupFolderPath: mockOpts.backupFolderPath,
		//   })
		// );
		expect(logSuccess).toHaveBeenCalledWith('configuration set successfully');
	});
});
