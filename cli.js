#! /usr/bin/env node

import { program } from "commander";

import { gcloudLogin } from "./utils.js";
import backUpAll from "./index.js";
import backUpApiProxy from "./api-proxy.js";
import backUpSharedFlow from "./shared-flow.js";
import backUpApiProduct from "./api-product.js";
import backUpDev from "./developers.js";
import backUpDevApp from "./dev-app.js";
import backUpFlowHooks from "./Flow-Hooks.js";
import backUpCustomReports from "./Custom-report.js";
import backUpTargetServer from "./target-server.js";

program
  .name("apigee-backup-tool")
  .description(
    "CLI tool to backup  apigee resources like api proxies, shared flows, Api products etc"
  )
  .version("1.0.0");

program
  .command("login")
  .description(
    "Login to google cloud - Runs 'gcloud application-default login' command"
  )
  .action(gcloudLogin);

program
  .command("all")

  .description(
    `
    Back up following Apigee resources
        1. Api Proxy
        2. Shared Flow
        3. Api Products
        4. Developers
        5. Developer Apps
        6. Custom Reports
        7. Flow Hooks
        8. Target Servers
    `
  )
  .action(backUpAll);

program
  .command("api-proxy")
  .description("Backup all revisions of all Api Proxies")
  .action(backUpApiProxy);

program
  .command("shared-flow")
  .description("Backup all revisions of all Shared Flows")
  .action(backUpSharedFlow);

program
  .command("api-product")
  .description("Backup all Api Products")
  .action(backUpApiProduct);

program
  .command("developer")
  .description("Backup all App Developers")
  .action(backUpDev);

program
  .command("dev-app")
  .description("Backup all developer Apps")
  .action(backUpDevApp);

program
  .command("flow-hook")
  .requiredOption("-e, --envName <string>", "Name of the environment")
  .description("Backup all Flow Hooks")
  .action((options) => backUpFlowHooks(options.envName));

program
  .command("custom-report")
  .description("Backup all Custom Reports")
  .action(backUpCustomReports);

program
  .command("target-server")
  .description("Backup all Target Server")
  .requiredOption("-e, --envName <string>", "Name of the environment")
  .action((options) => backUpTargetServer(options.envName));

program.parse();
