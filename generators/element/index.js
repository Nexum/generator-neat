"use strict";

let generators = require('yeoman-generator');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = generators.Base.extend({

    /**
     * Prompts for user input
     */
    prompting: function () {
        return this.prompt([
            {
                type: 'input',
                name: 'category',
                message: 'Your element\'s category name',
                default: ""
            },
            {
                type: 'input',
                name: 'name',
                message: 'Your element name',
                default: ""
            },
            {
                type: 'input',
                name: 'file',
                message: 'Your element file (default is the name)',
                default: ""
            },
            {
                type: 'input',
                name: 'action',
                message: 'Your element action (default is the name)',
                default: ""
            }
        ]).then((answers) => {
            this.data = {
                category: answers.category.toLowerCase(),
                name: answers.name.toLowerCase(),
                action: (answers.action || answers.name).toLowerCase(),
                actionFunc: capitalizeFirstLetter((answers.action || answers.name).toLowerCase()),
                className: capitalizeFirstLetter(answers.name.toLowerCase()),
                file: (answers.file || answers.name).toLowerCase() + ".js",
                templateName: (() => {
                    if (answers.action) {
                        return answers.name.toLowerCase() + capitalizeFirstLetter(answers.action.toLowerCase());
                    } else {
                        return answers.name.toLowerCase();
                    }
                })()
            }
        });
    },

    /**
     * Writes the new files
     */
    writing: function () {
        let elementJSONDestination = this.destinationPath('config/elements/' + this.data.category + '.json');
        let elementJSON = {
            name: this.data.name,
            action: this.data.action,
            file: this.data.file,
            cache: false,
            config: {}
        };

        if (!this.fs.exists(elementJSONDestination)) {
            this.fs.writeJSON(
                elementJSONDestination,
                [elementJSON],
                null,
                4
            );
        } else {
            let content = this.fs.readJSON(elementJSONDestination);
            let exists = false;

            for (let i = 0; i < content.length; i++) {
                let existingElement = content[i];

                if (existingElement.name === elementJSON.name) {
                    this.log.error("An element with the same name already exists in " + this.data.category);
                    exists = true;
                }
            }

            if (!exists) {
                content.push(elementJSON);
                this.fs.writeJSON(
                    elementJSONDestination,
                    content,
                    null,
                    4
                );
                this.log.info("Added new element " + elementJSON.name + " to the file");
            }
        }

        let classDestination = this.destinationPath('elements/' + this.data.category + '/' + this.data.name + '.js');
        if (!this.fs.exists(classDestination)) {
            this.fs.copyTpl(
                this.templatePath('element-class.js.ejs'),
                classDestination,
                this.data
            );
        } else {
            this.log.warn("Element class does already exist, you need to put in the new method yourself: " + this.data.actionFunc);
        }

        let viewDestination = this.destinationPath('frontend/templates/elements/' + this.data.category + '/' + this.data.templateName + '.ejs');
        if (!this.fs.exists(viewDestination)) {
            this.fs.copyTpl(
                this.templatePath('element-view.ejs'),
                viewDestination,
                this.data
            );
        } else {
            this.log.warn("Element tempalte already exists!");
        }
    }
})