# APIGEE - Backup automation script

**The automation script can backup Apigee Api Proxies, Shared flows, Api Products etc**

> NOTE: The Script is tested and works perfectly on Linux(ubuntu) and nodejs version 16.19.1

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

1. run  `gcloud auth application-default login`

2. run `npm install` to install all the dependencies, from inside the respository where package.json file is located

3. update organization(apigee organization- you will find this in the top left dropdown in the apigee console/ project id in the GCP console ), backupFolderPath (path of the backup folder , add "/" at the end of the path) in config.json

4. Run below npm scripts as per requirement

run `npm run backupAll` to backup Api Proxy, Api product,developer apps , developers, target server etc

run `npm run backupApiProxy` to backup Api Proxies

run `npm run backupSharedFlow` to backup Shared Flows

run `npm run backupApiProduct` to backup Api Products

run `npm run backupDev` to backup Developers

run `npm run backupDevApp` to backup Developer App

run `npm run backupCustomReports` to backup Custom Reports

run `npm run backupFlowHooks --envName=env-name` to backup Flow Hooks for a specific environment

run `npm run backupTargetServer --envName=env-name` to backup Custom Reports for a specific environment

5. Run step 1 and step 3 everytime you want to switch between gcp accounts and apigee organization

#### As a cli tool

1. run `npm install` to install all the dependencies, from inside the respository where package.json file is located

2. run `npm install -g .` to install the script as a global npm package
   
3. Now you can run the script as a cli tool from anywhere from your ubuntu machine

4. run `apigee-backup-tool login` to authenticate with google cloud

5. run `apigee-backup-tool config set --orgName name-of-organization --backupFolderPath /path/to/backup/folder/` to configure the apigee organization name and backup folder path

6. run `apigee-backup-tool --help` to get help on all the available commands

```
Usage: apigee-backup-tool [options] [command]

CLI tool to backup  apigee resources like api proxies, shared flows, Api products etc

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  config [options] <action>  configure organization name and backupFolderPath
  backup [options] <type>    Backup a specific apigee resource
  login                      Login to google cloud - Runs 'gcloud application-default login' command
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
      
  api-proxy                  Backup all revisions of all Api Proxies
  shared-flow                Backup all revisions of all Shared Flows
  api-product                Backup all Api Products
  developer                  Backup all App Developers
  developer-app                    Backup all developer Apps
  flow-hook [options]        Backup all Flow Hooks
  custom-report              Backup all Custom Reports
  target-server [options]    Backup all Target Server
  help [command]             display help for command


```
7. run following commands as per requirements

    - run `apigee-backup-tool all` or `apigee-backup-tool backup all` to backup all apigee resources
  
    - run `apigee-backup-tool api-proxy` or `apigee-backup-tool backup api-proxy` to backup all revisions of all api proxies

    - run `apigee-backup-tool shared-flow` or `apigee-backup-tool backup shared-flow` to backup all revisions of all shared flows

    - run `apigee-backup-tool api-product` or `apigee-backup-tool backup api-product` to backup all Api Products

    - run `apigee-backup-tool developer` or `apigee-backup-tool backup developer` to backup all  all Developers

    - run `apigee-backup-tool developer-app` or `apigee-backup-tool backup developer-app` to backup all  all Developer Apps

    - run `apigee-backup-tool custom-report` or `apigee-backup-tool backup custom-report` to backup all Custom reports

    - run `apigee-backup-tool flow-hook` or `apigee-backup-tool backup flow-hook` to backup all flow hooks for a specific environment
            **The above command takes name of the environment as an option**
    ```

        apigee-backup-tool flow-hook -e environment-name
        
        or 

        apigee-backup-tool backup flow-hook --envName environment-name
    ```


    - run `apigee-backup-tool target-server` or `apigee-backup-tool backup target-server` to backup all Target servers for a specific environment
            **The above command takes name of the environment as an option**

    ```
        apigee-backup-tool target-server -e environment-name
        
        or 

        apigee-backup-tool backup target-server --envName environment-name
    ```

8. Run step 4 and step 5 everytime you want to switch between gcp accounts and apigee organization

 








