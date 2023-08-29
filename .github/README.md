# APIGEE - Backup Tool

#### Supports both Apigee x and Apigee hybrid , does not support Apigee Edge

**The tool can backup Apigee Api Proxies, Shared flows, Api Products etc**

> NOTE: The Script is tested and works fine on Linux(ubuntu) and nodejs version >16

### Prerequisite

1. Download [gcloud](https://cloud.google.com/sdk/docs/install)

2. Install [nodejs](https://nodejs.org/)
3. Clone the repository

4. Create a directory where you want to backup all apigee objects

### Getting Started

There are 2 ways you can run the apigee-backup-script.

1. Using npm scripts
2. As a cli tool

#### Using npm scripts

Refer [Documentation](https://niveussolutions.github.io/apigee-x-backup-tool/)

#### As a cli tool

This tool is published to npm registry. Can be installed as a global npm package and used as a cli tool - [https://www.npmjs.com/package/@niveus/apigee-backup-tool](https://www.npmjs.com/package/@niveus/apigee-backup-tool)

```
Usage: apigee-backup-tool [options] [command]

CLI tool to backup  apigee resources like api proxies, shared flows, Api
products etc

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  config [options] <action>  configure organization name and backupFolderPath
  backup [options] <type>    Backup a specific apigee resource
  login                      Login to google cloud - Runs 'gcloud
                             application-default login' command
  all
      Back up following Apigee resources
          1. Api Proxy
          2. Shared Flow
          3. Api Products
          4. Developers
          5. Developer Apps
          6. Custom Reports
          7. Flow Hooks
          8. Target Servers

  api-proxy [options]        Backup all revisions of all Api Proxies
  shared-flow [options]      Backup all revisions of all Shared Flows
  api-product [options]      Backup all Api Products
  developer [options]        Backup all App Developers
  developer-app [options]    Backup all developer Apps
  flow-hook [options]        Backup all Flow Hooks
  custom-report [options]    Backup all Custom Reports
  target-server [options]    Backup all Target Server
  help [command]             display help for command



```
