const fs = require('fs');
const fetch = require('node-fetch');
const {
    prompt
} = require('inquirer');
const chalk = require('chalk');

const upload = (answers) => {
    // Check for "extension.json" file
    if (!fs.existsSync('./output/extension.json')) {
        console.log(chalk.red('No output file found for extension, please make sure to run "bullhorn extract" first!'));
        return;
    }

    // Find file and prompt
    console.log(chalk.blue('Output file found! The following will be uploaded:'));
    let extension = fs.readFileSync('./output/extension.json', 'utf-8');
    console.log(chalk.yellow(extension));

    prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to continue?',
        default: false
    }]).then((areYouSure) => {
        if (areYouSure.confirm) {
            // Generate URL
            let URL = `${answers.restUrl}/services/Extensions/install?BhRestToken=${answers.BhRestToken}`;

            // Force install?
            if (answers.forceInstall) {
                URL += '&forceInstall=true';
            }

            console.log(chalk.blue(`Uploading to ${URL}...`));

            // Push
            fetch(URL, {
                    method: 'POST',
                    body: extension
                })
                .then(response => response.json())
                .then(result => {
                    if (result.errorMessage) {
                        console.log(chalk.red(result.errorMessage.detailMessage));
                        console.log(chalk.red('Re-run with forceInstall as true to avoid this message...'));
                    } else {
                        console.log(chalk.blue('Success! Extension installed, details:'));
                        console.log(chalk.yellow(require('util').inspect(result, {
                            colors: true,
                            depth: null
                        })));
                        console.log(chalk.blue('Save this "extensionID" to uninstall at a later date...'));
                    }
                })
                .catch(error => {
                    console.log(chalk.red(error));
                });
        }
    });
}

// Export all methods
module.exports = {
    upload
};