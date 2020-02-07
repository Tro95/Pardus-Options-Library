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

/**
 *  Controls the description for a specific OptionsBox, only one description per OptionsBox permitted
 */
function DescriptionElement(id) {
    this.id = id;
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
    this.addImageLeft = (imageSrc) => {
        this.imageLeft = `<td><img src="${imageSrc}"></td>`;
        this.refreshElement();
    };
    this.addImageRight = (imageSrc) => {
        this.imageRight = `<td><img src="${imageSrc}"></td>`;
        this.refreshElement();
    };
    this.setDescription = (descriptionToSet) => {
        this.description = descriptionToSet;

        if (this.description === '') {
            this.frontContainer.setStyle('display: none;');
        } else {
            this.frontContainer.setStyle('');
        }

        this.refreshElement();
    };
    this.setAlignment = (alignment) => {
        this.alignment = alignment;
        this.refreshElement();
    };

    /**
     *  Converts the DescriptionElement into its html form.
     */
    this.toString = () => `${this.frontContainer + this.imageLeft}<td align="${this.alignment}">${this.imageRight}${this.description}</td>${this.backContainer}`;
    this.refreshElement = () => {
        this.element = htmlToElement(this.toString());
        document.getElementById(this.id).replaceWith(this.element);
    };
}

function BooleanOption(id, variableToBind, textDescription, defaultValue = false, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
    this.id = id;
    this.saveFunction = saveFunction;
    this.getFunction = getFunction;
    this.type = 'checkbox';
    this.variableToBind = variableToBind;
    this.textDescription = textDescription;
    this.toString = () => {
        let checkedStatus = '';
        if (this.getValue() === true) {
            checkedStatus = ' checked';
        }
        return `<tr><td>${this.textDescription}</td><td><input id="${this.id}" type="checkbox"${checkedStatus}></td></tr>`;
    };
    this.initialiseValue = () => {

    };
    this.getValue = () => this.getFunction(`${getUniverse()}_${this.variableToBind}`, defaultValue);
    this.saveValue = () => {
        // Save function is required due to Tampermonkey script scoping, otherwise all
        // scripts would GM_setValue to the first script to initiate the library.
        this.saveFunction(`${getUniverse()}_${this.variableToBind}`, document.getElementById(this.id).checked);
    };
    this.setFunctions = () => {

    };
}

function NumericOption(id, variableToBind, textDescription, defaultValue = 0, minValue = 0, maxValue = 0, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
    this.id = id;
    this.saveFunction = saveFunction;
    this.getFunction = getFunction;
    this.type = 'checkbox';
    this.variableToBind = variableToBind;
    this.textDescription = textDescription;
    this.toString = () => `<tr><td>${this.textDescription}</td><td><input id="${this.id}" type="number" min="${minValue}" max="${maxValue}" value="${this.getValue()}"></td></tr>`;
    this.initialiseValue = () => {

    };
    this.getValue = () => this.getFunction(`${getUniverse()}_${this.variableToBind}`, defaultValue);
    this.saveValue = () => {
        // Save function is required due to Tampermonkey script scoping, otherwise all
        // scripts would GM_setValue to the first script to initiate the library.
        this.saveFunction(`${getUniverse()}_${this.variableToBind}`, document.getElementById(this.id).value);
    };
}

function SelectOption(id, variableToBind, textDescription, options = [], defaultValue = null, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
    this.id = id;
    this.saveFunction = saveFunction;
    this.getFunction = getFunction;
    this.type = 'checkbox';
    this.variableToBind = variableToBind;
    this.textDescription = textDescription;
    this.options = options;
    this.toString = () => {
        const selectHtml = `<tr><td>${this.textDescription}</td><td>${this.getInnerHTML()}</td></tr>`;
        return selectHtml;
    };
    this.getInnerHTML = () => {
        let selectHtml = `<select id="${this.id}">`;
        const savedValue = this.getValue();
        let hasSelected = false;
        for (let i = 0; i < this.options.length; i += 1) {
            if (!hasSelected && (this.options[i].value === savedValue || (this.options[i].default && this.options[i].default === true))) {
                selectHtml += `<option value=${this.options[i].value} selected>${this.options[i].text}</option>`;
                hasSelected = true;
            } else {
                selectHtml += `<option value=${this.options[i].value}>${this.options[i].text}</option>`;
            }
        }

        return selectHtml;
    };
    this.initialiseValue = () => {

    };
    this.getValue = () => this.getFunction(`${getUniverse()}_${this.variableToBind}`, defaultValue);
    this.getCurrentValue = () => this.getElement().value;
    this.saveValue = () => {
        // Save function is required due to Tampermonkey script scoping, otherwise all
        // scripts would GM_setValue to the first script to initiate the library.
        this.saveFunction(`${getUniverse()}_${this.variableToBind}`, this.getCurrentValue());
    };
    this.refreshElement = () => {
        this.element = htmlToElement(this.getInnerHTML());
        this.getElement().replaceWith(this.element);
    };
    this.getElement = () => document.getElementById(this.id);
}

function OptionsGroup(id, premium = false, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
    this.id = id;
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
    this.saveButton = `<td align="right"><input value="Save" id="${this.id}-save-button" type="button"></td>`;
    this.saveButtonBackContainer = '</tr>';
    this.premium = premium;
    if (this.premium) {
        this.saveButton = `<td align="right"><input value="Save" id="${this.id}-save-button" type="button" style="color:#FFCC11"></td>`;
    }

    this.addOption = () => {

    };
    this.addBooleanOption = (variableToBind, textDescription, defaultValue = false, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newOption = new BooleanOption(`${this.id}-option-${this.options.length}`, variableToBind, textDescription, defaultValue, customSaveFunction, customGetFunction);
        this.options.push(newOption);
        return newOption;
    };
    this.addNumericOption = (variableToBind, textDescription, defaultValue = 0, minValue = 0, maxValue = 0, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newOption = new NumericOption(`${this.id}-option-${this.options.length}`, variableToBind, textDescription, defaultValue, minValue, maxValue, customSaveFunction, customGetFunction);
        this.options.push(newOption);
        return newOption;
    };
    this.addSelectOption = (variableToBind, textDescription, options = [], defaultValue = null, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newOption = new SelectOption(`${this.id}-option-${this.options.length}`, variableToBind, textDescription, options, defaultValue, customSaveFunction, customGetFunction);
        this.options.push(newOption);
        return newOption;
    };
    this.setFunctions = () => {
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
    };
    this.toString = () => {
        // If no options have been defined, then don't add any elements
        if (this.options.length === 0) {
            this.frontContainer.setStyle('display: none;');
            this.saveButtonFrontContainer.setStyle('display: none;');
        } else {
            this.frontContainer.setStyle('');
            this.saveButtonFrontContainer.setStyle('');
        }

        return this.frontContainer + this.options.join('') + this.backContainer + this.saveButtonFrontContainer + this.saveButton + this.saveButtonBackContainer;
    };
}

function OptionsBox(id, number, heading, premium = false, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
    let headerHtml = '<th>';
    if (premium === true) {
        headerHtml = '<th class="premium">';
    }
    this.id = `options-content-${id.toString()}-box-${number.toString()}`;
    this.saveFunction = saveFunction;
    this.getFunction = getFunction;
    this.frontContainer = `<form id="${this.id}" action="none"><table style="background:url(//static.pardus.at/img/std/bgd.gif)" width="100%" cellpadding="3" align="center"><tbody><tr>${headerHtml}${heading}</th></tr>`;
    this.backContainer = '</tbody></table></form>';
    this.innerHtml = '';
    this.description = new DescriptionElement(`${this.id}-description`);
    this.optionsGroup = new OptionsGroup(`${this.id}-options-group`, premium, saveFunction, getFunction);
    this.element = htmlToElement(this.frontContainer + this.description + this.innerHtml + this.optionsGroup + this.backContainer);
    this.refreshElement = () => {
        this.element = htmlToElement(this.frontContainer + this.description + this.innerHtml + this.optionsGroup + this.backContainer);
        document.getElementById(this.id).replaceWith(this.element);
        this.optionsGroup.setFunctions();
    };
    this.setInnerHTML = (innerHtmlToSet) => {
        this.innerHtml = innerHtmlToSet;
        this.refreshElement();
    };
    this.initialise = () => {
        this.optionsGroup.setFunctions();
    };
    this.addBooleanOption = (variableToBind, textDescription, defaultValue = false, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newOption = this.optionsGroup.addBooleanOption(variableToBind, textDescription, defaultValue, customSaveFunction, customGetFunction);
        this.refreshElement();
        return newOption;
    };
    this.addNumericOption = (variableToBind, textDescription, defaultValue = 0, minValue = 0, maxValue = 0, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newOption = this.optionsGroup.addNumericOption(variableToBind, textDescription, defaultValue, minValue, maxValue, customSaveFunction, customGetFunction);
        this.refreshElement();
        return newOption;
    };
    this.addSelectOption = (variableToBind, textDescription, options = [], defaultValue = null, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newOption = this.optionsGroup.addSelectOption(variableToBind, textDescription, options, defaultValue, customSaveFunction, customGetFunction);
        this.refreshElement();
        return newOption;
    };
}

function OptionsContent(id, saveFunction = defaultSaveFunction, getFunction = defaultGetFunction) {
    this.id = id;
    this.saveFunction = saveFunction;
    this.getFunction = getFunction;
    this.leftBoxes = [];
    this.rightBoxes = [];
    this.leftElement = document.getElementById(`options-content-${id.toString()}-left`);
    this.rightElement = document.getElementById(`options-content-${id.toString()}-right`);
    this.addBox = (heading, premium = false, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        let newBox = null;
        if (this.leftBoxes.length <= this.rightBoxes.length) {
            newBox = this.addBoxLeft(heading, premium, customSaveFunction, customGetFunction);
        } else {
            newBox = this.addBoxRight(heading, premium, customSaveFunction, customGetFunction);
        }
        console.log(newBox);
        return newBox;
    };
    this.addBoxLeft = (heading, premium = false, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newBox = new OptionsBox(`${id}-left`, this.leftBoxes.length, heading, premium, customSaveFunction, customGetFunction);
        this.leftElement.appendChild(newBox.element);
        this.leftElement.appendChild(document.createElement('br'));
        this.leftElement.appendChild(document.createElement('br'));
        this.leftBoxes.push(newBox);
        newBox.initialise();
        return newBox;
    };
    this.addBoxRight = (heading, premium = false, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => {
        const newBox = new OptionsBox(`${id}-right`, this.rightBoxes.length, heading, premium, customSaveFunction, customGetFunction);
        this.rightElement.appendChild(newBox.element);
        this.rightElement.appendChild(document.createElement('br'));
        this.rightElement.appendChild(document.createElement('br'));
        this.rightBoxes.push(newBox);
        newBox.initialise();
        return newBox;
    };
    this.addPremiumBox = (heading, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => this.addBox(heading, true, customSaveFunction, customGetFunction);
    this.addPremiumBoxLeft = (heading, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => this.addBoxLeft(heading, true, customSaveFunction, customGetFunction);
    this.addPremiumBoxRight = (heading, customSaveFunction = this.saveFunction, customGetFunction = this.getFunction) => this.addBoxRight(heading, true, customSaveFunction, customGetFunction);
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

        return new OptionsContent(newTab.id, saveFunction, getFunction);
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
