/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from 'google-auth-library';
const auth = new GoogleAuth();
import {
	getApiProductConfigFromApigee,
	getConfig,
	getListOfApiProductsFromApigee,
	saveApiProductLocally,
} from './utils.js';

import { logError, logWarning, logSuccess, logInfo } from './chalk.js';

const config = getConfig();
const organizationName = config.organization;
const localBackUpPath = config.backupFolderPath + 'api product';

const backUpApiProduct = async (all, apiProductName) => {
	try {
		const authToken = await auth.getAccessToken();

		const options = {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		};
		if (all) {
			const apiProductsInApigee = await getListOfApiProductsFromApigee(
				organizationName,
				options,
			);

			if (!apiProductsInApigee || !Array.isArray(apiProductsInApigee)) {
				logError(
					'Something went wrong: Could not fetch Api products from Apigee',
				);
				return;
			} else if (
				Array.isArray(apiProductsInApigee) &&
        apiProductsInApigee.length === 0
			) {
				logInfo('No Api products found');
				return;
			}

			apiProductsInApigee.map(async (product) => {
				const apiProduct = await getApiProductConfigFromApigee(
					organizationName,
					options,
					product,
				);
				if (!apiProduct) {
					logError(
						`Something went wrong: Could not fetch Api Product-${product} from Apigee`,
					);
					return;
				}
				const fileName = `${product}.json`;
				saveApiProductLocally(
					localBackUpPath,
					fileName,
					JSON.stringify(apiProduct),
				);
			});
		} else if (!all && apiProductName) {
			const apiProduct = await getApiProductConfigFromApigee(
				organizationName,
				options,
				apiProductName,
			);
			if (!apiProduct) {
				logError(
					`Something went wrong: Could not fetch Api Product-${apiProductName} from Apigee`,
				);
				return;
			}
			const fileName = `${apiProductName}.json`;
			saveApiProductLocally(
				localBackUpPath,
				fileName,
				JSON.stringify(apiProduct),
			);
		} else {
			throw Error(
				'specify --name option to backup specific api product or --all option',
			);
		}
	} catch (error) {
		logError(error.message);
	}
};

export default backUpApiProduct;
