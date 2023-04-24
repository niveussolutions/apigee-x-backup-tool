#! /usr/bin/env node

import { program } from "commander";

import { gcloudLogin, setConfig } from "./utils.js";
import backUpAll from "./index.js";
import backUpApiProxy from "./api-proxy.js";
import backUpSharedFlow from "./shared-flow.js";
import backUpApiProduct from "./api-product.js";
import backUpDev from "./developers.js";
import backUpDevApp from "./dev-app.js";
import backUpFlowHooks from "./Flow-Hooks.js";
import backUpCustomReports from "./Custom-report.js";
import backUpTargetServer from "./target-server.js";
import { logError } from "./chalk.js";

function backup(apigeeResourceType) {
  switch (apigeeResourceType) {
    case "all":
      backUpAll();
      break;
    case "api-proxy":
      backUpApiProxy();
      break;
    case "shared-flow":
      backUpSharedFlow();
      break;
    case "api-product":
      backUpApiProduct();
      break;
    case "developer":
      backUpDev();
      break;
    case "developer-app":
      backUpDevApp();
      break;
    case "target-server":
      backUpTargetServer(this.opts().envName);
      break;
    case "flow-hook":
      backUpFlowHooks(this.opts().envName);
      break;
    case "custom-report":
      backUpCustomReports();
      break;
    default:
      console.log("illegal apigee resource type");
  }
}

program
  .name("apigee-backup-tool")
  .description(
    "CLI tool to backup  apigee resources like api proxies, shared flows, Api products etc"
  )
  .version("1.0.0");

program
  .command("config")
  .argument("<action>", "Config action (set)")
  .description("configure organization name and backupFolderPath")
  .requiredOption("-O, --orgName <string>", "Name of the apigee organization")
  .requiredOption(
    "-F, --backupFolderPath <string>",
    "Path for the backup folder"
  )
  .action(setConfig);

program
  .command("backup")
  .description("Backup a specific apigee resource")
  .addHelpText(
    "after",
    `
    this command takes a <type> argument which can be one of the following Apigee resource
    1. all
    2. api-proxy
    3. shared-flow,
    4. developer,
    5. developer-app
    6. custom-report
    7. api-product,
    8. flow-hook,
    9. target-server

    Ex: apigee-backup-tool backup all
        apigee-backup-tool backup api-proxy
        apigee-backup-tool backup shared-flow
        apigee-backup-tool backup target-server --envName <environment-name>
        apigee-backup-tool backup flow-hook --envName <environment-name>
  `
  )
  .argument("<type>", "Apigee resource Type")
  .option(
    "-e, --envName <string>",
    "Name of the environment. Applicable to type target-server and flow-hook",
    "None"
  )
  .action(backup);

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
  .command("developer-app")
  .description("Backup all developer Apps")
  .action(backUpDevApp);

program
  .command("flow-hook")
  .requiredOption("-e, --envName <string>", "Name of the environment")
  .description("Backup all Flow Hooks")
  .action(function () {
    return backUpFlowHooks(this.opts().envName);
  });

program
  .command("custom-report")
  .description("Backup all Custom Reports")
  .action(backUpCustomReports);

program
  .command("target-server")
  .description("Backup all Target Server")
  .requiredOption("-e, --envName <string>", "Name of the environment")
  .action(function () {
    backUpTargetServer(this.opts().envName);
  });

program.parse();
