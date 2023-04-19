# APIGEE - Backup automation script

**The automation script can backup Apigee Api Proxies, Shared flows, Api Products etc**

> NOTE: The Script is tested and works perfectly on Linux(ubuntu) and nodejs version 16.19.1

### Get Started

1. Download [gcloud](https://cloud.google.com/sdk/docs/install)

2. Install [nodejs](https://nodejs.org/)

3. set gcp project `gcloud config set project <project_id>`

4. run `gcloud auth login` or `gcloud auth application-default login`

5. Clone this repository

6. run `npm install` to install all the dependencies, from inside the respository where package.json file is located

7. Create a directory where you want to backup all apigee objects

8. **update organization(apigee organization- you will find this in the top left dropdown in the apigee console/ project id in the GCP console ), local backup basepath (path of the backup folder , add "/" at the end of the path) in config.js**

### Start Backup

run `npm run backupAll` to backup Api Proxy, Api product,developer apps , developers, target server etc

run `npm run backupApiProxy` to backup Api Proxies

run `npm run backupSharedFlow` to backup Shared Flows

run `npm run backupApiProduct` to backup Api Products

run `npm run backupDev` to backup Developers

run `npm run backupDevApp` to backup Developer App

run `npm run backupCustomReports` to backup Custom Reports

run `npm run backupFlowHooks --envName=env-name` to backup Flow Hooks for a specific environment

run `npm run backupTargetServer --envName=env-name` to backup Custom Reports for a specific environment



### Switch to different organization

1. Login to google cloud using
 `gcloud auth application-default login`
2. Update organization name and backup folder path in config.js file


