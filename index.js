import backUpApiProxy from './lib/api-proxy.js';
import backUpSharedFlow from './lib/shared-flow.js';
import backedUpApiProduct from './lib/api-product.js';
import backUpDev from './lib/developers.js';
import backUpDevApp from './lib/dev-app.js';
import backUpTargetServer from './lib/target-server.js';
import backUpCustomReports from './lib/Custom-report.js';
import backupFlowHooks from './lib/Flow-Hooks.js';
import { getAuthToken, getConfig, listEnvironments } from './lib/utils.js';

const config = getConfig();

const organizationName = config.organization;

const backUpAll = async () => {
	const authToken = await getAuthToken();
	const options = {
		headers: {
			Authorization: `Bearer ${authToken}`,
		},
	};
	const envs = await listEnvironments(organizationName, options);

	await backUpApiProxy(true);
	await backUpSharedFlow(true);
	await backedUpApiProduct(true);
	await backUpDev(true);
	await backUpDevApp(true);
	await backUpCustomReports(true);

	envs.forEach(async (env) => {
		await backUpTargetServer(false, env);
		await backupFlowHooks(false, env);
	});
};

export default backUpAll;
