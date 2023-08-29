/**
 * Download api proxies from apigee and backup locally
 *can also backup api proxies to cloud storage
 *
 *
 */

import { GoogleAuth } from 'google-auth-library'
const auth = new GoogleAuth()
import {
  saveDevAppLocally,
  getListOfDevsFromApigee,
  getDevAppConfigFromApigee,
  getListOfDevAppsFromApigee,
  getConfig,
} from './utils.js'

import { logError, logWarning, logSuccess, logInfo } from './chalk.js'
const config = getConfig()
const organizationName = config.organization
const localBackUpPath = config.backupFolderPath + 'developer apps'

const backUpDevApp = async (all, appName, devEmail) => {
  try {
    const authToken = await auth.getAccessToken()

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
    if (all) {
      const devsInApigee = await getListOfDevsFromApigee(
        organizationName,
        options,
      )

      if (!devsInApigee || !Array.isArray(devsInApigee)) {
        logError('Something went wrong: Could not fetch developers from Apigee')
        return
      } else if (Array.isArray(devsInApigee) && devsInApigee.length === 0) {
        logInfo('No developers found')
        return
      }

      devsInApigee.map(async (dev) => {
        const devAppsInApigee = await getListOfDevAppsFromApigee(
          organizationName,
          dev,
          options,
        )

        if (!devAppsInApigee || !Array.isArray(devAppsInApigee)) {
          logError(
            `Something went wrong : Could not fetch apps for developer ${dev}`,
          )
          return
        } else if (
          Array.isArray(devAppsInApigee) &&
          devAppsInApigee.length === 0
        ) {
          logInfo(`No apps found for ${dev}`)
          return
        }

        devAppsInApigee.map(async (app) => {
          const devAppJson = await getDevAppConfigFromApigee(
            organizationName,
            dev,
            app,
            options,
          )

          if (!devAppJson) {
            logError(
              `Something went wrong: Could not fetch app-${app} for developer-${dev}`,
            )
          }
          const fileName = `${dev}--${devAppJson.name}.json`

          saveDevAppLocally(
            localBackUpPath,
            fileName,
            JSON.stringify(devAppJson),
          )
        })
      })
    } else if (!all && appName && devEmail) {
      const devAppJson = await getDevAppConfigFromApigee(
        organizationName,
        devEmail,
        appName,
        options,
      )

      if (!devAppJson) {
        logError(
          `Something went wrong: Could not fetch app-${appName} for developer-${devEmail}`,
        )
      }
      const fileName = `${devEmail}--${devAppJson.name}.json`

      saveDevAppLocally(localBackUpPath, fileName, JSON.stringify(devAppJson))
    } else {
      throw Error(
        'specify --name and --dev option to backup a specific app or --all option',
      )
    }
  } catch (error) {
    logError(error.message)
  }
}

export default backUpDevApp
