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
import { logError, logWarning } from "./chalk.js";

function config(action) {
  switch (action) {
    case "set":
      setConfig(this.opts());
      break;
    default:
      logError(`illegal action - ${action}`);
  }
}

function backup(apigeeResourceType) {
  const envName = this.opts().envName;
  const all = this.opts().all;
  const name = this.opts().name;
  const revision = this.opts().revision;
  const devEmail = this.opts().dev;

  if (
    apigeeResourceType !== "flow-hook" &&
    apigeeResourceType !== "target-server" &&
    envName != "None"
  ) {
    logWarning(
      `--envName is a optional parameter and it is not expected for apigee resource of type-${apigeeResourceType}`
    );
  }

  if (apigeeResourceType === "all" && all) {
    logWarning(
      `--all option is not expected for apigee resource of type -${apigeeResourceType}`
    );
  }

  if (
    apigeeResourceType === "api-proxy" ||
    apigeeResourceType === "shared-flow"
  ) {
    if (!all && (!name || !revision)) {
      logError(
        `requires --name and --revision options or provide --all option`
      );
      return;
    }
  }

  if (
    apigeeResourceType !== "api-proxy" &&
    apigeeResourceType !== "shared-flow" &&
    revision
  ) {
    logWarning(
      `--revision option is not expected for apigee resource of type - ${apigeeResourceType}`
    );
  }

  if (apigeeResourceType !== "developer-app" && devEmail) {
    logWarning(
      `--dev option is not expected for apigee resource of type - ${apigeeResourceType}`
    );
  }

  switch (apigeeResourceType) {
    case "all":
      backUpAll();
      break;
    case "api-proxy":
      backUpApiProxy(all, name, revision);
      break;
    case "shared-flow":
      backUpSharedFlow(all, name, revision);
      break;
    case "api-product":
      backUpApiProduct(all, name);
      break;
    case "developer":
      backUpDev(all, name);
      break;
    case "developer-app":
      backUpDevApp(all, name, devEmail);
      break;
    case "target-server":
      backUpTargetServer(all, envName);
      break;
    case "flow-hook":
      backUpFlowHooks(all, envName);
      break;
    case "custom-report":
      backUpCustomReports(all, name);
      break;
    default:
      logError(`illegal apigee resource type - ${apigeeResourceType}`);
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
  .action(config);

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
  .option("--all", "Back up all", false)
  .option("--name <string>", "Name of the apigee resource")
  .option("--dev <string>", "developer email")
  .option(
    "--revision <string>",
    "Revision of the apigee api proxy or shared flow"
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
  .option("--all", "Back up all", false)
  .option("--name <string>", "Name of the apigee api proxy")
  .option("--revision <string>", "Revision of the apigee api proxy")
  .action(function () {
    backUpApiProxy(this.opts().all, this.opts().name, this.opts().revision);
  });

program
  .command("shared-flow")
  .description("Backup all revisions of all Shared Flows")
  .option("--all", "Back up all", false)
  .option("--name <string>", "Name of the apigee shared flow")
  .option("--revision <string>", "Revision of the apigee shared flow")
  .action(function () {
    backUpSharedFlow(this.opts().all, this.opts().name, this.opts().revision);
  });

program
  .command("api-product")
  .description("Backup all Api Products")
  .option("--all", "Back up all", false)
  .option("--name <string>", "Name of the apigee api product")
  .action(function () {
    backUpApiProduct(this.opts().all, this.opts().name);
  });

program
  .command("developer")
  .description("Backup all App Developers")
  .option("--all", "Back up all", false)
  .option("--name <string>", "Email of the apigee developer")

  .action(function () {
    backUpDev(this.opts().all, this.opts().name);
  });

program
  .command("developer-app")
  .description("Backup all developer Apps")
  .option("--all", "Back up all", false)
  .option("--name <string>", "name of the developer app")
  .option("--dev <string>", "developer email")
  .action(function () {
    backUpDevApp(this.opts().all, this.opts().name, this.opts().dev);
  });

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
  .option("--all", "Back up all", false)
  .option("--name <string>", "name of the custom report")
  .action(function () {
    backUpCustomReports(this.opts().all, this.opts().name);
  });

program
  .command("target-server")
  .description("Backup all Target Server")
  .requiredOption("-e, --envName <string>", "Name of the environment")
  .action(function () {
    backUpTargetServer(this.opts().envName);
  });

program.parse();
