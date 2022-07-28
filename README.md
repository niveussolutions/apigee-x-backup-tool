# APIGEE - Backup automation script

**The automation script can backup Apigee Api Proxies, Shared flows, Api Products etc**

> NOTE: We can extend the script to backup to cloud storage

### Pre-requisites

1. Download [gcloud](https://cloud.google.com/sdk/docs/install)

2. run `gcloud auth application-default login`

3. set gcp project `gcloud config set project <project_id>`

4. Install [nodejs](https://nodejs.org/)

5. Clone the project

6. run `npm install`

7. create a directory where you want to backup all proxies

8. **update organization(apigee organization- you will find this in the top left dropdown in the apigee console/ project id in the GCP console ), local backup basepath (backup directory basepath) in config.js**

### Start Backup

run `npm run backupApiProxy` to backup all Api Proxy revisions

run `npm run backupSharedFlow` to backup all Shared Flow revisions

run `npm run backupApiProduct` to backup all Api Products

run `npm run backupDevApp` to backup all developer apps

run `npm run backupDev` to backup all developers

run `npm run backupTargetServer --envname=name-of-environment` to backup all target server, pass the name of the environment as argument to the command as shown here

run `npm run backUpFlowHooks --envname=name-of-environment` to backup all Flow hook

run `npm run backUpCustomReports` to backup all Custom reports

run `npm run backupAll --envname=name-of-environment` to backup Api Proxy, Api product,developer apps , developers, target server

> NOTE: Pass `envname` argument as shown above, if you want to backup target server
