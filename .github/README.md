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

1. run `gcloud auth application-default login`

2. run `npm install` to install all the dependencies, from inside the respository where package.json file is located

3. update organization(apigee organization- you will find this in the top left dropdown in the apigee console/ project id in the GCP console ), backupFolderPath (path of the backup folder , add "/" at the end of the path) in config.json

4. Run below npm scripts as per requirement

run `npm run backupAll` to backup Api Proxy, Api product,developer apps , developers, target server etc

run below scripts to backup Api Proxies

```
  // To backup all revisions of all api proxy
  npm run backupApiProxy --all

  // To backup specific revision of a specific api proxy
  npm run backupApiProxy --name=name-of-proxy --revision=revision-of-proxy

```

run below scripts to backup Shared Flows

```
  // To backup all revisions of all shared flows
  npm run backupSharedFlow --all

  // To backup specific revision of a specific shared flow
  npm run backupSharedFlow --name=name-of-sharedflow --revision=revision-of-sharedflow

```

run below scripts to backup Api Products

```
  // To backup all Api Products
  npm run backupApiProduct --all

  // To backup  a specific Api Product
  npm run backupApiProduct --name=name-of-api-product

```

run below scripts to backup Developers

```
  // To backup all Developers
  npm run backupDev --all

  // To backup  a specific Developer
  npm run backupDev --name=developer-email

```

run below scripts to backup Developer App

```
  // To backup all Developer Apps
  npm run backupDevApp --all

  // To backup  a specific Developer App
  npm run backupDevApp --name=name-of-app --developer=developer-email

```

run below scripts to backup Custom Reports

```
  // To backup all Custom reports
  npm run backupCustomReports --all

  // To backup  a specific Custom Report
  npm run backupCustomReports --name=name-of-custom-report

  name-of-custom-report - is actually a id Ex: 3aed7d5c-330d-4e30-acf1-d19a25be64ba

```

run below scripts to backup Flow Hooks

```
  // To backup all Flow hooks for all environments
  npm run backupFlowHooks --all

  // To backup  all Flow hooks for a specific environment
  npm run backupFlowHooks --envName=name-of-environment


```

run below scripts to backup Target servers for a specific environment

```
  // To backup all Target servers for all environments
  npm run backupTargetServer --all

  // To backup  all Target Servers for a specific environment
  npm run backupTargetServer --envName=name-of-environment


```

1. Run step 1 and step 3 everytime you want to switch between gcp accounts and apigee organization

#### As a cli tool

This tool is published to npm registry. Can be installed as a global npm package and used as a cli tool - [https://www.npmjs.com/package/@niveus/apigee-backup-tool](https://www.npmjs.com/package/@niveus/apigee-backup-tool)

[Documentation Link](https://niveussolutions.github.io/apigee-x-backup-tool/)

**or**

1. run `npm install` to install all the dependencies, from inside the respository where package.json file is located

2. run `npm install -g .` to install the script as a global npm package
3. Now you can run the script as a cli tool from anywhere from your ubuntu machine

4. run `apigee-backup-tool login` to authenticate with google cloud

5. run `apigee-backup-tool config set --orgName name-of-organization --backupFolderPath /path/to/backup/folder/` to configure the apigee organization name and backup folder path

6. run `apigee-backup-tool --help` to get help on all the available commands

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

7. run following commands as required

   - run `apigee-backup-tool all` or `apigee-backup-tool backup all` to backup all apigee resources
   - run below commands to backup Api Proxies

     ```
       // To backup all revisions of all api proxies
       apigee-backup-tool api-proxy --all
       or
       apigee-backup-tool backup api-proxy --all

       // To backup specific revision of a specific api proxy

       apigee-backup-tool api-proxy --name name-of-proxy --revision proxy-revision
       or
       apigee-backup-tool backup api-proxy --name name-of-proxy --revision proxy-revision


     ```

   - run below commands to backup shared flows

     ```
       // To backup all revisions of all shared flows
       apigee-backup-tool shared-flow --all
       or
       apigee-backup-tool backup shared-flow --all

       // To backup specific revision of a specific shared flow

       apigee-backup-tool shared-flow --name name-of-shared-flow --revision shared-flow-revision
       or
       apigee-backup-tool backup shared-flow --name name-of-shared-flow --revision shared-flow-revision


     ```

   - run below commands to backup Api Products

     ```
       // To backup all Api Products
       apigee-backup-tool api-product --all
       or
       apigee-backup-tool backup api-product --all

       // To backup a specific api product

       apigee-backup-tool api-product --name name-of-api-product
       or
       apigee-backup-tool backup api-product --name name-of-api-product
     ```

   - run below commands to backup Developers

     ```
       // To backup all Developers
       apigee-backup-tool developer --all
       or
       apigee-backup-tool backup developer --all

       // To backup a specific Developer

       apigee-backup-tool developer --name developer-email
       or
       apigee-backup-tool backup developer --name developer-email
     ```

   - run below commands to backup Developer Apps

     ```
       // To backup all Developer Apps
       apigee-backup-tool developer-app --all
       or
       apigee-backup-tool backup developer-app --all

       // To backup a specific Developer app

       apigee-backup-tool developer-app --dev developer-email --name app-name
       or
       apigee-backup-tool backup developer-app --dev developer-email --name app-name
     ```

   - run below commands to backup Custom reports

     ```
       // To backup all Custom reports
       apigee-backup-tool custom-report --all
       or
       apigee-backup-tool backup custom-report --all

       // To backup a specific custom report

       apigee-backup-tool custom-report  --name custom-report-name
       or
       apigee-backup-tool backup custom-report  --name custom-report-name

       custom-report-name - is actually an id Ex: 3aed7d5c-330d-4e30-acf1-d19a25be64ba
     ```

   - run below commands to backup flow hooks

     ```
       // To backup all flow hooks for all environments
       apigee-backup-tool flow-hook --all
       or
       apigee-backup-tool backup flow-hook --all

       //To backup all flow hooks for specific environment
       apigee-backup-tool flow-hook --envName name-of-environment
       or
       apigee-backup-tool backup flow-hook --envName name-of-environment
     ```

   - run below commands to backup Target servers

     ```

     // To backup all Target servers for all environment
         apigee-backup-tool target-server --all
         or
         apigee-backup-tool backup target-server --all

     //To backup all Target servers for specific environment
       apigee-backup-tool target-server --envName name-of-environment
       or
       apigee-backup-tool backup target-server --envName name-of-environment


     ```

8. Run step 4 and step 5 everytime you want to switch between gcp accounts and apigee organization
