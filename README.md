# APIGEE - Backup automation script

**The automation script can backup Apigee Api Proxies, Shared flows, Api Products etc**

> NOTE: The Script is tested and works perfectly on Linux(ubuntu)

### Pre-requisites

1. Download [gcloud](https://cloud.google.com/sdk/docs/install)

2. Install [nodejs](https://nodejs.org/)

3. set gcp project `gcloud config set project <project_id>`

4. run `gcloud auth login` or `gcloud auth application-default login`

5. Clone this repository

6. run `npm install` to install all the dependencies, from inside the respository where package.json file is located

7. Create a directory where you want to backup all apigee objects

8. **update organization(apigee organization- you will find this in the top left dropdown in the apigee console/ project id in the GCP console ), local backup basepath (path of the backup folder , add "/" at the end of the path) in config.js**

### Start Backup

run `npm run backupAll` to backup Api Proxy, Api product,developer apps , developers, target server


