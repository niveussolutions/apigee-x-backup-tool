import chalk from "chalk";

const logError = (message) => console.log(chalk.red(message));
const logWarning = (message) => console.log(chalk.yellow(message));
const logSuccess = (message) => console.log(chalk.green(message));
const logInfo = (message) => console.log(chalk.blue(message));

export { logError, logWarning, logSuccess, logInfo };
