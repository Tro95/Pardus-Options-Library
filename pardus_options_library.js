/* global unsafeWindow */

/**
 *  Helper functions
 */

function defaultSaveFunction(key, value) {
    console.warn(`Default save function not overridden, script cannot save key '${key}' with value '${value}'`);
}

function defaultGetFunction(key, defaultValue = null) {
    console.warn(`Default get function not overridden, script cannot get key '${key}' with default value ${defaultValue}'.`);
}

/**
 *  Returns the active universe
 */
function getUniverse() {
    switch (document.location.hostname) {
        case 'orion.pardus.at':
            return 'orion';
        case 'artemis.pardus.at':
            return 'artemis';
        case 'pegasus.pardus.at':
            return 'pegasus';
        default:
            throw new Error('Unable to determine universe');
    }
}

/**
 *  Turns an HTML string into an embeddable DOM element
 */
function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

class HtmlElement {
    constructor(id) {
        this.id = id;
    }

    toString() {
        return `<div id='${this.id}'></div>`;
    }

    refreshElement() {
        this.getElement().replaceWith(this.toElement());
    }

    getElement() {
        return document.getElementById(this.id);
    }

    toElement() {
        const template = document.createElement('template');
        template.innerHTML = this.toString();
        return template.content.firstChild;
    }
}

/**
 *  Controls the description for a specific OptionsBox, only one description per OptionsBox permitted
 */
class DescriptionElement extends HtmlElement {
    constructor(id) {
        super(id);
        this.backContainer = '</tr></tbody></table></td></tr>';
        this.description = '';
        this.imageLeft = '';
        this.imageRight = '';
        this.alignment = 'center';
        this.frontContainer = {
            styling: 'style="display: none;"',
            id: '',
            setId(idToSet) {
                this.id = idToSet;
            },
            setStyle(style) {
                this.styling = `style="${style}"`;
            },
            toString() {
                return `<tr id=${this.id} ${this.styling}><td><table><tbody><tr>`;
            },
        };
        this.frontContainer.setId(id);
        this.element = htmlToElement(this.toString());
    }

    addImageLeft(imageSrc) {
        this.imageLeft = `<td><img src="${imageSrc}"></td>`;
        this.refreshElement();
    }

    addImageRight(imageSrc) {
        this.imageRight = `<td><img src="${imageSrc}"></td>`;
        this.refreshElement();
    }

    setDescription(descriptionToSet) {
        this.description = descriptionToSet;

        if (this.description === '') {
            this.frontContainer.setStyle('display: none;');
        } else {
            this.frontContainer.setStyle('');
        }

        this.refreshElement();
    }

    setAlignment(alignment) {
        this.alignment = alignment;
        this.refreshElement();
    }

    toString() {
        return `${this.frontContainer + this.imageLeft}<td align="${this.alignment}">${this.imageRight}${this.description}</td>${this.backContainer}`;
    }
}

class AbstractOption extends HtmlElement {
    constructor({
        id,
        variable,
        description,
        defaultValue = false,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
        shallow = false,
    }) {
        super(id);
        this.variable = variable;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.textDescription = description;
        this.defaultValue = defaultValue;
        this.inputId = `${this.id}-input`;
        this.shallow = shallow;
    }

    toString() {
        if (this.shallow) {
            return `<td id='${this.id}'>${this.getInnerHTML()}<label>${this.textDescription}</label></td>`;
        }
        return `<tr id='${this.id}'><td>${this.textDescription}</td><td>${this.getInnerHTML()}</td></tr>`;
    }

    getInnerHTML() {
        return '';
    }

    getValue() {
        return this.getFunction(`${getUniverse()}_${this.variable}`, this.defaultValue);
    }

    getCurrentValue() {
        return null;
    }

    getInputElement() {
        return document.getElementById(this.inputId);
    }

    saveValue() {
        this.saveFunction(`${getUniverse()}_${this.variable}`, this.getCurrentValue());
    }
}

class BooleanOption extends AbstractOption {
    getInnerHTML() {
        let checkedStatus = '';
        if (this.getValue() === true) {
            checkedStatus = ' checked';
        }
        return `<input id="${this.inputId}" type="checkbox"${checkedStatus}>`;
    }

    getCurrentValue() {
        return this.getInputElement().checked;
    }
}

class NumericOption extends AbstractOption {
    constructor({
        id,
        variable,
        description,
        defaultValue = 0,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
        min = 0,
        max = 0,
        step = 1,
    }) {
        super({
            id,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
        });
        this.minValue = min;
        this.maxValue = max;
        this.stepValue = step;
    }

    getInnerHTML() {
        return `<input id="${this.inputId}" type="number" min="${this.minValue}" max="${this.maxValue}" step="${this.stepValue}" value="${this.getValue()}">`;
    }

    getCurrentValue() {
        return this.getInputElement().value;
    }
}

class SelectOption extends AbstractOption {
    constructor({
        id,
        variable,
        description,
        defaultValue = null,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
        options = [],
    }) {
        super({
            id,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
        });
        this.options = options;
    }

    getInnerHTML() {
        let selectHtml = `<select id="${this.inputId}">`;
        const savedValue = this.getValue();
        let hasSelected = false;
        for (const option of this.options) {
            if (!hasSelected && (option.value === savedValue || (option.default && option.default === true))) {
                selectHtml += `<option value=${option.value} selected>${option.text}</option>`;
                hasSelected = true;
            } else {
                selectHtml += `<option value=${option.value}>${option.text}</option>`;
            }
        }

        return selectHtml;
    }

    getOptions() {
        return this.options;
    }

    setOptions(options = []) {
        this.options = options;
    }

    getCurrentValue() {
        return this.getInputElement().value;
    }
}

/*
class AbstractArrayOption extends AbstractOption {
    constructor({
        id,
        variable,
        description,
        defaultValue = [],
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
    }) {
        super({
            id,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
        });
    }

    toString() {
        return `<tr id="${this.id}"><td>${this.description}</td><td>${this.getInnerHTML()}</td></tr>`;
    }

    getInnerHTML() {
        let html = '<table><tbody>';
        const currentValues = this.getValue();

        for (value of currentValues) {
            html += `<tr><td><input type="text" value="${value}"></td><td><input type="button" value="-"></td></tr>`;
        }
        html += `<tr><td><input type="text" value="${value}"></td><td><input type="button" value="+"></td></tr>`;
        html += '</tbody></table>';
        return html;
    }


}*/

class GroupedOptions extends HtmlElement {
    constructor({
        id,
        description,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
    }) {
        super(id);
        this.description = description;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.options = [];
    }

    toString() {
        return `<tr id="${this.id}"><td>${this.description}</td><td>${this.getInnerHTML()}</td></tr>`;
    }

    getInnerHTML() {
        let html = '<table><tbody><tr>';
        for (const option of this.options) {
            html += option;
        }
        html += '</tr></tbody></table>';
        return html;
    }

    saveValue() {
        for (const option of this.options) {
            option.saveValue();
        }
    }

    addBooleanOption({
        variable,
        description,
        defaultValue = false,
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const booleanOptions = {
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
            shallow: true,
        };

        const newBooleanOption = new BooleanOption(booleanOptions);

        this.options.push(newBooleanOption);
        this.refreshElement();
        return newBooleanOption;
    }
}

class OptionsGroup extends HtmlElement {
    constructor({
        id,
        premium = false,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
    }) {
        super(id);
        this.premium = premium;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.options = [];
        this.frontContainer = {
            styling: 'style="display: none;"',
            id: '',
            setId(idToSet) {
                this.id = idToSet;
            },
            setStyle(style) {
                this.styling = `style="${style}"`;
            },
            toString() {
                return `<tr id="${this.id}" ${this.styling}><td><table><tbody>`;
            },
        };
        this.frontContainer.setId(id);
        this.backContainer = '</tbody></table></td></tr>';
        this.saveButtonFrontContainer = {
            styling: 'style="display: none;"',
            id: '',
            setId(idToSet) {
                this.id = idToSet;
            },
            setStyle(style) {
                this.styling = `style="${style}"`;
            },
            toString() {
                return `<tr id="${this.id}" ${this.styling}>`;
            },
        };
        this.saveButtonFrontContainer.setId(`${id}-save-button-row`);
        if (premium) {
            this.saveButton = `<td align="right"><input value="Save" id="${this.id}-save-button" type="button" style="color:#FFCC11"></td>`;
        } else {
            this.saveButton = `<td align="right"><input value="Save" id="${this.id}-save-button" type="button"></td>`;
        }
        this.saveButtonBackContainer = '</tr>';
    }

    addBooleanOption({
        variable,
        description,
        defaultValue = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const options = {
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        };

        const newOption = new BooleanOption(options);
        this.options.push(newOption);
        return newOption;
    }

    addNumericOption({
        variable,
        description,
        defaultValue = 0,
        min = 0,
        max = 0,
        step = 1,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const options = {
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            min,
            max,
            step,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        };

        const newOption = new NumericOption(options);
        this.options.push(newOption);
        return newOption;
    }

    addSelectOption({
        variable,
        description,
        defaultValue = 0,
        options = [],
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const selectOptions = {
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            options,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        };

        const newOption = new SelectOption(selectOptions);
        this.options.push(newOption);
        return newOption;
    }

    addGroupedOption({
        description,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const groupedOptions = {
            id: `${this.id}-option-${this.options.length}`,
            description,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        };

        const newOption = new GroupedOptions(groupedOptions);
        this.options.push(newOption);
        return newOption;
    }

    setFunctions() {
        const self = this;

        function displaySaved(saveButtonId) {
            const saveButton = document.getElementById(saveButtonId);
            saveButton.setAttribute('disabled', 'true');
            saveButton.value = 'Saved';
            saveButton.setAttribute('style', 'color:green;background-color:silver');
            setTimeout(() => {
                saveButton.removeAttribute('disabled');
                saveButton.value = 'Save';
                saveButton.removeAttribute('style');
            }, 2000);
        }

        function displayPremiumSaved(saveButtonId) {
            const saveButton = document.getElementById(saveButtonId);
            saveButton.setAttribute('disabled', 'true');
            saveButton.value = 'Saved';
            saveButton.setAttribute('style', 'color:green;background-color:silver');
            setTimeout(() => {
                saveButton.removeAttribute('disabled');
                saveButton.value = 'Save';
                saveButton.setAttribute('style', 'color:#FFCC11');
            }, 2000);
        }

        function saveButtonFunction() {
            let i = 0;
            for (i = 0; i < self.options.length; i += 1) {
                self.options[i].saveValue();
            }
            if (self.premium) {
                displayPremiumSaved(`${self.id}-save-button`);
            } else {
                displaySaved(`${self.id}-save-button`);
            }
        }

        if (document.getElementById(`${this.id}-save-button`)) {
            if (document.getElementById(`${this.id}-save-button`).addEventListener) {
                document.getElementById(`${this.id}-save-button`).addEventListener('click', saveButtonFunction, false);
            } else if (document.getElementById(`${this.id}-save-button`).attachEvent) {
                document.getElementById(`${this.id}-save-button`).attachEvent('onclick', saveButtonFunction);
            }
        } else {
            console.log(`No element '${this.id}-save-button'.`);
        }

        for (let i = 0; i < this.options.length; i += 1) {
            if (typeof this.options[i].setFunctions === 'function') {
                this.options[i].setFunctions();
            }
        }
    }

    toString() {
        // If no options have been defined, then don't add any elements
        if (this.options.length === 0) {
            this.frontContainer.setStyle('display: none;');
            this.saveButtonFrontContainer.setStyle('display: none;');
        } else {
            this.frontContainer.setStyle('');
            this.saveButtonFrontContainer.setStyle('');
        }

        return this.frontContainer + this.options.join('') + this.backContainer + this.saveButtonFrontContainer + this.saveButton + this.saveButtonBackContainer;
    }
}

class OptionsBox extends HtmlElement {
    constructor({
        id,
        heading,
        premium = false,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
    }) {
        super(id);
        this.heading = heading;
        this.premium = premium;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;

        const headerHtml = (premium) ? '<th class="premium">' : '<th>';
        this.frontContainer = `<form id="${this.id}" action="none"><table style="background:url(//static.pardus.at/img/std/bgd.gif)" width="100%" cellpadding="3" align="center"><tbody><tr>${headerHtml}${heading}</th></tr>`;
        this.backContainer = '</tbody></table></form>';
        this.innerHtml = '';
        this.description = new DescriptionElement(`${this.id}-description`);
        this.optionsGroup = new OptionsGroup({
            id: `${this.id}-options-group`,
            premium,
            saveFunction,
            getFunction,
        });
    }

    toString() {
        return this.frontContainer + this.description + this.innerHtml + this.optionsGroup + this.backContainer;
    }

    refreshElement() {
        this.getElement().replaceWith(this.toElement());
        this.initialise();
    }

    initialise() {
        this.optionsGroup.setFunctions();
    }

    addBooleanOption({
        variable,
        description,
        defaultValue = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const booleanOptions = {
            variable,
            description,
            defaultValue,
            customSaveFunction,
            customGetFunction,
        };
        const newOption = this.optionsGroup.addBooleanOption(booleanOptions);
        this.refreshElement();
        return newOption;
    }

    addNumericOption({
        variable,
        description,
        defaultValue = false,
        min = 0,
        max = 0,
        step = 1,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const numericOptions = {
            variable,
            description,
            defaultValue,
            min,
            max,
            step,
            customSaveFunction,
            customGetFunction,
        };
        const newOption = this.optionsGroup.addNumericOption(numericOptions);
        this.refreshElement();
        return newOption;
    }

    addSelectOption({
        variable,
        description,
        defaultValue = false,
        options = [],
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const selectOptions = {
            variable,
            description,
            defaultValue,
            options,
            customSaveFunction,
            customGetFunction,
        };
        const newOption = this.optionsGroup.addSelectOption(selectOptions);
        this.refreshElement();
        return newOption;
    }

    addGroupedOption({
        description,
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const groupedOptions = {
            description,
            saveFunction,
            getFunction,
        };

        const newOption = this.optionsGroup.addGroupedOption(groupedOptions);
        this.refreshElement();
        return newOption;
    }
}

class OptionsContent extends HtmlElement {
    constructor({
        id,
        saveFunction = defaultSaveFunction,
        getFunction = defaultGetFunction,
    }) {
        super(id);
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.leftBoxes = [];
        this.rightBoxes = [];
        this.leftElement = document.getElementById(`options-content-${id.toString()}-left`);
        this.rightElement = document.getElementById(`options-content-${id.toString()}-right`);
    }

    addBox({
        heading,
        premium = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        let newBox = null;
        if (this.leftBoxes.length <= this.rightBoxes.length) {
            newBox = this.addBoxLeft({
                heading,
                premium,
                customSaveFunction,
                customGetFunction,
            });
        } else {
            newBox = this.addBoxRight({
                heading,
                premium,
                customSaveFunction,
                customGetFunction,
            });
        }
        return newBox;
    }

    addBoxLeft({
        heading,
        premium = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const newBox = new OptionsBox({
            id: `options-content-${this.id}-left-box-${this.leftBoxes.length}`,
            heading,
            premium,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
        this.leftElement.appendChild(newBox.toElement());
        this.leftElement.appendChild(document.createElement('br'));
        this.leftElement.appendChild(document.createElement('br'));
        this.leftBoxes.push(newBox);
        newBox.initialise();
        return newBox;
    }

    addBoxRight({
        heading,
        premium = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const newBox = new OptionsBox({
            id: `options-content-${this.id}-right-box-${this.rightBoxes.length}`,
            heading,
            premium,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
        this.rightElement.appendChild(newBox.toElement());
        this.rightElement.appendChild(document.createElement('br'));
        this.rightElement.appendChild(document.createElement('br'));
        this.rightBoxes.push(newBox);
        newBox.initialise();
        return newBox;
    }

    addPremiumBox({
        heading,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        return this.addBox({
            heading,
            premium: true,
            customSaveFunction,
            customGetFunction,
        });
    }

    addPremiumBoxLeft({
        heading,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        return this.addBoxLeft({
            heading,
            premium: true,
            customSaveFunction,
            customGetFunction,
        });
    }

    addPremiumBoxRight({
        heading,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        return this.addBoxRight({
            heading,
            premium: true,
            customSaveFunction,
            customGetFunction,
        });
    }
}

const Options = (function initOptions() {
    // Required for compatibility
    const version = 1.2;

    let tabs = [];
    let tabsElement = null;
    let contentElement = null;

    function getVersion() {
        return version;
    }

    function createTabElement(label, id) {
        return htmlToElement(`<td id="${id.toString()}" style="background: transparent url(&quot;//static.pardus.at/img/std/tab.png&quot;) repeat scroll 0% 0%; cursor: default;" onmouseover="this.style.background='url(//static.pardus.at/img/std/tabactive.png)';this.style.cursor='default'" onmouseout="this.style.background='url(//static.pardus.at/img/std/tab.png)'" class="tabcontent">${label}</td>`);
    }

    function createTabContentElement(label, id) {
        return htmlToElement(`<table hidden class="messagestyle" id="options-content-${id.toString()}" style="background:url(//static.pardus.at/img/std/bgdark.gif)"><tbody><tr><td><div align="center"><h1>${label}</h1></div><div id="saved-message" align="center" hidden=""><h2><font style="border:2px; border-style:solid; border-radius:10px; border-color:#00AA00; padding: 5px;" color="green">Settings saved</font></h2></div><table width="100%" align="center"><tbody><tr><td id="options-content-${id.toString()}-left" width="350" valign="top"></td><td width="40"></td><td id="options-content-${id.toString()}-right" width="350" valign="top"></td></tr></tbody></table></td></tr></tbody></table>`);
    }

    function setAsActive(id) {
        for (let i = 0; i < tabs.length; i += 1) {
            if (tabs[i].id !== id) {
                tabs[i].tabElement.setAttribute('style', "background: transparent url('//static.pardus.at/img/std/tab.png') repeat scroll 0% 0%; cursor: default;");
                tabs[i].tabElement.setAttribute('onmouseover', "this.style.background='url(//static.pardus.at/img/std/tabactive.png)';this.style.cursor='default'");
                tabs[i].tabElement.setAttribute('onmouseout', "this.style.background='url(//static.pardus.at/img/std/tab.png)'");
                tabs[i].contentElement.setAttribute('hidden', '');
                tabs[i].active = false;
            } else {
                tabs[i].tabElement.setAttribute('style', "background: transparent url('//static.pardus.at/img/std/tabactive.png') repeat scroll 0% 0%; cursor: default;");
                tabs[i].tabElement.setAttribute('onmouseover', "this.style.cursor='default'");
                tabs[i].tabElement.removeAttribute('onmouseout');
                tabs[i].contentElement.removeAttribute('hidden');
                tabs[i].active = true;
            }
        }
    }

    function addTab(label, id, content, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
        let tmpContentElement = null;

        if (content) {
            tmpContentElement = content;
        } else {
            tmpContentElement = createTabContentElement(label, id);
        }

        const newTab = {
            active: false,
            label,
            id: id.toString(),
            contentElement: tmpContentElement,
            tabElement: createTabElement(label, id),
        };

        newTab.tabElement.addEventListener('click', () => setAsActive(newTab.id), true);
        tabsElement.childNodes[0].childNodes[0].appendChild(newTab.tabElement);
        tabsElement.width = (tabs.length + 1) * 96;
        contentElement.childNodes[0].appendChild(newTab.contentElement);
        tabs.push(newTab);

        return new OptionsContent({
            id: newTab.id,
            saveFunction,
            getFunction,
        });
    }

    function initialise() {
        // HTML for both the options tabs and the content area
        const optionsHtml = '<table id="options-area"><tbody><tr><td><table id="options-tabs" width="96" cellspacing="0" cellpadding="0" border="0" align="left"><tbody><tr></tr></tbody></table></td></tr><tr id="options-content"><td></td></tr></tbody></table>';

        // Element for both the options tabs and the content area
        const optionsElement = htmlToElement(optionsHtml);

        const defaultPardusOptionsContent = document.getElementsByTagName('table')[2];
        const pardusMainElement = defaultPardusOptionsContent.parentNode;

        defaultPardusOptionsContent.setAttribute('id', 'options-content-pardus-default');
        defaultPardusOptionsContent.setAttribute('hidden', '');

        optionsElement.childNodes[0].childNodes[1].childNodes[0].appendChild(defaultPardusOptionsContent);

        pardusMainElement.appendChild(optionsElement);
        tabsElement = document.getElementById('options-tabs');
        contentElement = document.getElementById('options-content');

        addTab('Pardus Options', 'pardus-default', defaultPardusOptionsContent);
    }

    /* function drawTabs() {
        tabsElement.width = tabs.length * 96;
        tabsElement.childNodes[0].childNodes[0].innerHTML = '';
        for (let i = 0; i < tabs.length; i += 1) {
            tabsElement.childNodes[0].childNodes[0].appendChild(tabs[i].tabElement);
        }
    } */

    function exportUpgrade() {
        return {
            version: getVersion(),
            tabs,
            tabsElement,
            contentElement,
        };
    }

    function importUpgrade(importVals = { tabs: [], tabsElement: null, contentElement: null }) {
        tabs = importVals.tabs;
        tabsElement = importVals.tabsElement;
        contentElement = importVals.contentElement;
    }

    return {
        version() {
            return getVersion();
        },
        addNewTab(label, id, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
            return addTab(label, id, null, saveFunction, getFunction);
        },
        getTab(id) {
            let tabToReturn = null;
            for (let i = 0; i < tabs.length; i += 1) {
                if (tabs[i].id === id) {
                    tabToReturn = tabs[i];
                }
            }
            return tabToReturn;
        },
        create() {
            initialise();
            setAsActive('pardus-default');
        },
        exportUpgrade() {
            return exportUpgrade();
        },
        importUpgrade(importVals) {
            importUpgrade(importVals);
        },
    };
})();

/**
  *  Add the Options object to the page for all scripts to use
  */
if (document.location.pathname === '/options.php') {
    if (typeof unsafeWindow.Options === 'undefined' || !unsafeWindow.Options) {
        unsafeWindow.Options = Options;
        unsafeWindow.Options.create();
    } else if (unsafeWindow.Options && typeof unsafeWindow.Options.version === 'function' && unsafeWindow.Options.version() < Options.version()) {
        // Upgrade the version if two scripts use different ones
        // console.log(`Upgrading Pardus Options Library from version ${unsafeWindow.Options.version()} to ${Options.version()}.`);
        Options.importUpgrade(unsafeWindow.Options.exportUpgrade());
        unsafeWindow.Options = Options;
    }
}
