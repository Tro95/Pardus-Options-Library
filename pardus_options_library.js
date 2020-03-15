/* global unsafeWindow */

class PardusOptionsUtility {
    static defaultSaveFunction(key, value) {
        console.warn(`Default save function not overridden, script cannot save key '${key}' with value '${value}'`);
    }

    static defaultGetFunction(key, defaultValue = null) {
        console.warn(`Default get function not overridden, script cannot get key '${key}' with default value ${defaultValue}'.`);
    }

    /**
     *  Returns the active universe
     */
    static getUniverse() {
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
}

class HtmlElement {
    constructor(id) {
        this.id = id;
    }

    toString() {
        return `<div id='${this.id}'></div>`;
    }

    beforeRefreshElement() {
    }

    afterRefreshElement() {
    }

    refreshElement() {
        this.beforeRefreshElement();
        this.getElement().replaceWith(this.toElement());
        this.afterRefreshElement();
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
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
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
        return this.getFunction(`${PardusOptionsUtility.getUniverse()}_${this.variable}`, this.defaultValue);
    }

    getCurrentValue() {
        return null;
    }

    getInputElement() {
        return document.getElementById(this.inputId);
    }

    saveValue() {
        this.saveFunction(`${PardusOptionsUtility.getUniverse()}_${this.variable}`, this.getCurrentValue());
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
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
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
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
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
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
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

class SaveButton extends HtmlElement {
    constructor({
        id,
        premium = false,
    }) {
        super(id);
        this.premium = premium;

        if (this.premium) {
            this.colour = '#FFCC11';
        } else {
            this.colour = '#D0D1D9';
        }
    }

    toString() {
        return `<input value="Save" id="${this.id}" type="button" style="color:${this.colour}">`;
    }

    displaySaved() {
        this.getElement().setAttribute('disabled', 'true');
        this.getElement().value = 'Saved';
        this.getElement().setAttribute('style', 'color:green;background-color:silver');
        setTimeout(() => {
            this.getElement().removeAttribute('disabled');
            this.getElement().value = 'Save';
            if (this.premium) {
                this.getElement().setAttribute('style', 'color:#FFCC11');
            } else {
                this.getElement().removeAttribute('style');
            }
        }, 2000);
    }

    addClickEventListener({
        func,
    }) {
        if (this.getElement()) {
            if (this.getElement().addEventListener) {
                this.getElement().addEventListener('click', func, false);
            } else if (this.getElement().attachEvent) {
                this.getElement().attachEvent('onclick', func);
            }
        } else {
            console.log(`No element '${this.id}'.`);
        }
    }
}

class SaveButtonRow extends HtmlElement {
    constructor({
        id,
        premium = false,
    }) {
        super(id);
        this.premium = premium;
        this.saveButton = new SaveButton({
            id: `${this.id}-button`,
            premium,
        });
    }

    toString() {
        return `<tr id="${this.id}"><td align="right">${this.saveButton}</td></tr>`;
    }

    displaySaved() {
        this.saveButton.displaySaved();
    }

    addClickEventListener({
        func,
    }) {
        this.saveButton.addClickEventListener({
            func,
        });
    }
}

class OptionsGroup extends HtmlElement {
    constructor({
        id,
        premium = false,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
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
    }

    addBooleanOption({
        variable,
        description,
        defaultValue = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const newOption = new BooleanOption({
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
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
        const newOption = new NumericOption({
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            min,
            max,
            step,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
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
        const newOption = new SelectOption({
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            options,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
        this.options.push(newOption);
        return newOption;
    }

    addGroupedOption({
        description,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const newOption = new GroupedOptions({
            id: `${this.id}-option-${this.options.length}`,
            description,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
        this.options.push(newOption);
        return newOption;
    }

    toString() {
        // If no options have been defined, then don't add any elements
        if (this.options.length === 0) {
            this.frontContainer.setStyle('display: none;');
            return this.frontContainer + this.backContainer;
        }
        this.frontContainer.setStyle('');

        return this.frontContainer + this.options.join('') + this.backContainer;
    }

    afterRefreshElement() {
        this.setFunctions();
    }
}

class OptionsBox extends HtmlElement {
    constructor({
        id,
        heading,
        premium = false,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
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
        this.saveButtonRow = new SaveButtonRow({
            id: `${this.id}-save`,
            premium,
        });
    }

    toString() {
        if (this.optionsGroup.options.length === 0) {
            return this.frontContainer + this.description + this.innerHtml + this.optionsGroup + this.backContainer;
        }
        return this.frontContainer + this.description + this.innerHtml + this.optionsGroup + this.saveButtonRow + this.backContainer;
    }

    setFunctions() {
        if (this.optionsGroup.options.length !== 0) {
            this.saveButtonRow.addClickEventListener({
                func: () => {
                    for (const option of this.optionsGroup.options) {
                        option.saveValue();
                    }
                    this.saveButtonRow.displaySaved();
                },
            });
        }
    }

    afterRefreshElement() {
        this.setFunctions();
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
        heading,
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
    }) {
        super(id);
        this.heading = heading;
        this.content = content;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.leftBoxes = [];
        this.rightBoxes = [];
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
            id: `${this.id}-left-box-${this.leftBoxes.length}`,
            heading,
            premium,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
        this.leftBoxes.push(newBox);
        this.refreshElement();
        return newBox;
    }

    addBoxRight({
        heading,
        premium = false,
        customSaveFunction = this.saveFunction,
        customGetFunction = this.getFunction,
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-right-box-${this.rightBoxes.length}`,
            heading,
            premium,
            saveFunction: customSaveFunction,
            getFunction: customGetFunction,
        });
        this.rightBoxes.push(newBox);
        this.refreshElement();
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

    toString() {
        if (this.content !== null) {
            return this.content;
        }
        return `<table hidden class="messagestyle" id="${this.id}" style="background:url(//static.pardus.at/img/std/bgdark.gif)"><tbody><tr><td><div align="center"><h1>${this.heading}</h1></div><table width="100%" align="center"><tbody><tr><td id="${this.id}-left" width="350" valign="top">${this.leftBoxes.join('<br><br>')}</td><td width="40"></td><td id="${this.id}-right" width="350" valign="top">${this.rightBoxes.join('<br><br>')}</td></tr></tbody></table></td></tr></tbody></table>`;
    }

    afterRefreshElement() {
        for (const box of this.leftBoxes) {
            box.afterRefreshElement();
        }
        for (const box of this.rightBoxes) {
            box.afterRefreshElement();
        }
    }

    setActive() {
        this.getElement().removeAttribute('hidden');
    }

    setInactive() {
        this.getElement().setAttribute('hidden', '');
    }
}

class TabLabel extends HtmlElement {
    constructor({
        id,
        heading,
    }) {
        super(id);
        this.heading = heading;
        this.active = false;
    }

    toString() {
        if (this.active) {
            return `<td id="${this.id}" style="background: transparent url(&quot;//static.pardus.at/img/std/tabactive.png&quot;) repeat scroll 0% 0%; cursor: default;" onmouseover="this.style.cursor='default'" class="tabcontent">${this.heading}</td>`;
        }
        return `<td id="${this.id}" style="background: transparent url(&quot;//static.pardus.at/img/std/tab.png&quot;) repeat scroll 0% 0%; cursor: default;" onmouseover="this.style.background='url(//static.pardus.at/img/std/tabactive.png)';this.style.cursor='default'" onmouseout="this.style.background='url(//static.pardus.at/img/std/tab.png)'" class="tabcontent">${this.heading}</td>`;
    }

    setActive() {
        this.getElement().setAttribute('style', "background: transparent url('//static.pardus.at/img/std/tabactive.png') repeat scroll 0% 0%; cursor: default;");
        this.getElement().setAttribute('onmouseover', "this.style.cursor='default'");
        this.getElement().removeAttribute('onmouseout');
        this.active = true;
    }

    setInactive() {
        this.getElement().setAttribute('style', "background: transparent url('//static.pardus.at/img/std/tab.png') repeat scroll 0% 0%; cursor: default;");
        this.getElement().setAttribute('onmouseover', "this.style.background='url(//static.pardus.at/img/std/tabactive.png)';this.style.cursor='default'");
        this.getElement().setAttribute('onmouseout', "this.style.background='url(//static.pardus.at/img/std/tab.png)'");
        this.active = false;
    }
}

class Tab {
    constructor({
        id,
        heading,
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
    }) {
        this.id = id;
        this.heading = heading;
        this.content = new OptionsContent({
            id: `options-content-${this.id}`,
            heading,
            content,
            saveFunction,
            getFunction,
        });
        this.label = new TabLabel({
            id: `${this.id}-label`,
            heading,
        });
        this.active = false;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
    }

    setActive() {
        this.label.setActive();
        this.content.setActive();
        this.active = true;
    }

    setInactive() {
        this.label.setInactive();
        this.content.setInactive();
        this.active = false;
    }

    getContent() {
        return this.content;
    }

    getLabel() {
        return this.label;
    }
}

class TabsElement extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
        this.labels = [];
    }

    addLabel({
        label,
    }) {
        this.labels.push(label);
    }

    toString() {
        return `<table id="${this.id}" width="${this.labels.length * 96}" cellspacing="0" cellpadding="0" border="0" align="left"><tbody><tr>${this.labels.join('')}</tr></tbody></table>`;
    }
}

class ContentsArea extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
        this.contents = [];
    }

    addContent({
        content,
    }) {
        this.contents.push(content);
    }

    toString() {
        return `<tr id="${this.id}"><td>${this.contents.join('')}</td></tr>`;
    }

    afterRefreshElement() {
        for (const content of this.contents) {
            content.afterRefreshElement();
        }
    }
}

class PardusOptions extends HtmlElement {
    constructor({
        upgradeOptions = false,
        tabs = [],
        tabsElement = new TabsElement({
            id: 'options-tabs',
        }),
        contentElement = new ContentsArea({
            id: 'options-content',
        }),
    } = {}) {
        super('options-area');
        this.tabs = tabs;
        this.tabsElement = tabsElement;
        this.contentElement = contentElement;

        if (upgradeOptions) {
            return;
        }

        // Get the normal Pardus options
        const defaultPardusOptionsContent = document.getElementsByTagName('table')[2];

        // Identify the containing HTML element to house all the options HTML
        const pardusMainElement = defaultPardusOptionsContent.parentNode;

        // Give the Pardus options an appropriate id, and remove it from the DOM
        defaultPardusOptionsContent.setAttribute('id', 'options-content-pardus-default');
        defaultPardusOptionsContent.remove();

        // Add this object to the DOM within the main containing element
        pardusMainElement.appendChild(this.toElement());

        // Add the Pardus options back in
        this.addTab({
            id: 'pardus-default',
            heading: 'Pardus Options',
            content: defaultPardusOptionsContent.outerHTML,
        });

        // Set the Pardus options tab to be active by default
        this.setActiveTab('pardus-default');
    }

    static version() {
        return 1.4;
    }

    addTab({
        id,
        heading,
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
    }) {
        const newTab = new Tab({
            id,
            heading,
            content,
            saveFunction,
            getFunction,
        });

        this.tabs.push(newTab);
        this.tabsElement.addLabel({
            label: newTab.getLabel(),
        });
        this.contentElement.addContent({
            content: newTab.getContent(),
        });

        this.refreshElement();

        return newTab.getContent();
    }

    setActiveTab(id) {
        for (const tab of this.tabs) {
            if (tab.id === id) {
                tab.setActive();
            } else {
                tab.setInactive();
            }
        }
    }

    afterRefreshElement() {
        // Add the tab-switching logic
        for (const tab of this.tabs) {
            tab.getLabel().getElement().addEventListener('click', () => this.setActiveTab(tab.id), true);
        }

        this.contentElement.afterRefreshElement();
    }

    toString() {
        return `<table id="options-area"><tbody><tr><td>${this.tabsElement}</td></tr>${this.contentElement}</tbody></table>`;
    }
}

/**
  *  Add the Options object to the page for all scripts to use
  */
if (document.location.pathname === '/options.php') {
    if (typeof unsafeWindow.PardusOptions === 'undefined' || !unsafeWindow.PardusOptions) {
        unsafeWindow.PardusOptions = new PardusOptions();
    } else if (unsafeWindow.PardusOptions && typeof unsafeWindow.PardusOptions.constructor.version === 'function' && unsafeWindow.PardusOptions.constructor.version() < PardusOptions.version()) {
        // Upgrade the version if two scripts use different ones
        console.log(`Upgrading Pardus Options Library from version ${unsafeWindow.PardusOptions.constructor.version()} to ${PardusOptions.version()}.`);
        unsafeWindow.PardusOptions = new PardusOptions({
            upgradeOptions: true,
            tabs: unsafeWindow.PardusOptions.tabs,
            tabsElement: unsafeWindow.PardusOptions.tabsElement,
            contentElement: unsafeWindow.PardusOptions.contentElement,
        });
    }
}
