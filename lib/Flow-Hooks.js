/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import {
	saveFlowHooksLocally,
	getFlowHooksFromApigee,
	getConfig,
	listEnvironments,
	getAuthToken,
} from './utils.js';

import { logError } from './chalk.js';

const config = getConfig();
const organizationName = config.organization;
const localBackUpPath = config.backupFolderPath + 'Flow-Hooks';

const backUpFlowHooks = async (all, envName) => {
	if (!all && envName === 'None') {
		logError('requires --envName option or provide --all option ');
		return;
	}

	try {
		const authToken = await getAuthToken();

		const options = {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		};
		const flowhooksInApigee = [
			'PreProxyFlowHook',
			'PostProxyFlowHook',
			'PreTargetFlowHook',
			'PostTargetFlowHook',
		];
		if (all) {
			const envs = await listEnvironments(organizationName, options);
			envs.forEach(async (env) => {
				await backUpFlowHooks(false, env);
			});
		} else if (envName && !all) {
			flowhooksInApigee.map(async (fh) => {
				const tsJson = await getFlowHooksFromApigee(
					organizationName,
					envName,
					fh,
					options,
				);

				if (!tsJson) {
					logError(`Something is wrong: Could not get Flow hook ${fh} from Apigee`);
					return;
				}

				const fileName = `${fh}-${envName}.json`;
				saveFlowHooksLocally(localBackUpPath, fileName, JSON.stringify(tsJson));
			});
		} else {
			throw Error(
				'specify --envName to backup for a specific environment or provide --all option',
			);
		}
	} catch (error) {
		logError(error.message);
	}
};

export default backUpFlowHooks;
