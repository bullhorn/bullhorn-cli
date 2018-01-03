const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const jsonfile = require('jsonfile');

function cleanUpScriptString(script) {
    return script.replace(/function\s?\((\w+[,]?\s?)+\)\s?{((.|\n)*(?=}))}/gm, '$2').trim();
}

const extract = () => {
    // Check for "extension.json" file
    if (!fs.existsSync('./extension.json')) {
        console.log(chalk.red('Cannot find "extension.json" at the root level...'));
        console.log(chalk.red('Please make sure you are in an extension repo and you have an "extension.json" definition file'));
        return;
    }

    console.log(chalk.blue('Extracting extension points from "extension.json"'));

    // Load configuration
    const configuration = JSON.parse(fs.readFileSync('extension.json', 'utf-8'));

    // Check for name
    if (!configuration || !configuration.name) {
        console.log(chalk.red('"extension.json" must contain a "name" property...'));
    }

    // Create output object
    let output = {
        name: configuration.name
    };

    // If configuration has these, then make objects on output
    if (configuration.fieldInteractions) {
        output.fieldInteractions = {};
    }
    if (configuration.pageInteractions) {
        output.pageInteractions = [];
    }

    console.log(chalk.blue('Extracting extension points...'));

    if (configuration.fieldInteractions) {
        console.log(chalk.blue('  Extracting field interactions...'));
        Object.keys(configuration.fieldInteractions).forEach(key => {
            configuration.fieldInteractions[key].forEach(interaction => {
                let matches = glob.sync(interaction);
                matches.forEach(file => {
                    if (file.endsWith('.js')) {
                        console.log(chalk.blue(`    ${file}`));
                        let interactionConfig = require(path.join(process.cwd(), file)).default;
                        interactionConfig.script = cleanUpScriptString(interactionConfig.script.toString());
                        if (!output.fieldInteractions[key]) {
                            output.fieldInteractions[key] = [];
                        }
                        output.fieldInteractions[key].push(interactionConfig);
                    }
                });
            });
        });
    }

    if (configuration.pageInteractions) {
        console.log(chalk.blue('  Extracting page interactions...'));
        configuration.pageInteractions.forEach(interaction => {
            let matches = glob.sync(interaction);
            matches.forEach(file => {
                if (file.endsWith('.js')) {
                    console.log(chalk.blue(`    ${interaction}`));
                    let interactionConfig = require(path.join(process.cwd(), interaction)).default;
                    interactionConfig.script = cleanUpScriptString(interactionConfig.script.toString());
                    output.pageInteractions.push(interactionConfig);
                }
            });
        });
    }

    console.log(chalk.blue(`Extraction complete! File being written to config.json`));

    let file = `./output/extension.json`;

    if (!fs.existsSync('./output')) {
        fs.mkdirSync('./output');
    }

    jsonfile.writeFileSync(file, output, {
        spaces: 2
    });

    console.log(chalk.blue('Write file complete! Enjoy!'));
}

// Export all methods
module.exports = {
    extract
};