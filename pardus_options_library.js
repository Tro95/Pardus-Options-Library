/* global GM_setValue, GM_getValue */

class PardusOptionsUtility {
    static defaultSaveFunction(key, value) {
        return GM_setValue(key, value);
    }

    static defaultGetFunction(key, defaultValue = null) {
        return GM_getValue(key, defaultValue);
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

    /**
     *  Returns the universe-specific name of a variable
     */
    static getVariableName(variableName) {
        return `${this.getUniverse()}_${variableName}`;
    }

    static setActiveTab(id) {
        window.localStorage.setItem('pardusOptionsOpenTab', id);
        window.dispatchEvent(new window.Event('storage'));
    }
}

class HtmlElement {
    constructor(id) {
        // Make sure it is a valid html identifier
        if (!id || id === '') {
            throw new Error('Id cannot be empty.');
        }
        const validIds = RegExp('^[a-zA-Z][\\w:.-]*$');
        if (!validIds.test(id)) {
            throw new Error(`Id '${id}' is not a valid HTML identifier.`);
        }

        this.id = id;
        this.afterRefreshHooks = [];
        this.beforeRefreshHooks = [];
    }

    addEventListener(eventName, listener) {
        this.getElement().addEventListener(eventName, listener, false);
        this.addAfterRefreshHook(() => {
            this.getElement().addEventListener(eventName, listener, false);
        });
    }

    toString() {
        return `<div id='${this.id}'></div>`;
    }

    beforeRefreshElement() {
        for (const func of this.beforeRefreshHooks) {
            func();
        }
    }

    afterRefreshElement() {
        for (const func of this.afterRefreshHooks) {
            func();
        }
    }

    addAfterRefreshHook(func) {
        this.afterRefreshHooks.push(func);
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

    appendChild(ele) {
        return document.getElementById(this.id).appendChild(ele);
    }

    appendTableChild(ele) {
        return document.getElementById(this.id).firstChild.appendChild(ele);
    }
}

/**
 *  Controls the description for a specific OptionsBox, only one description per OptionsBox permitted
 */
class DescriptionElement extends HtmlElement {
    constructor({
        id,
        description = '',
        imageLeft = '',
        imageRight = '',
    }) {
        super(id);
        this.backContainer = '';
        this.description = description;
        this.imageLeft = imageLeft;
        this.imageRight = imageRight;
        this.alignment = '';
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
                return '';
            },
        };
        this.frontContainer.setId(id);
    }

    addImageLeft(imageSrc) {
        this.imageLeft = imageSrc;
        this.refreshElement();
    }

    addImageRight(imageSrc) {
        this.imageRight = imageSrc;
        this.refreshElement();
    }

    setDescription(description) {
        this.description = description;
        this.refreshElement();
    }

    setAlignment(alignment) {
        this.alignment = alignment;
        this.refreshElement();
    }

    toString() {
        let html = `<tr id=${this.id} style=''><td><table><tbody><tr>`;

        if (this.imageLeft && this.imageLeft !== '') {
            html = `${html}<td><img src="${this.imageLeft}"></td>`;
        }

        // If there's no specific alignment, work out the most ideal one to use
        if (this.alignment === '') {
            if (this.imageLeft === '' && this.imageRight === '') {
                html = `${html}<td align="left">${this.description}</td>`;
            } else {
                html = `${html}<td align="center">${this.description}</td>`;
            }
        } else {
            html = `${html}<td align="${this.alignment}">${this.description}</td>`;
        }

        if (this.imageRight && this.imageRight !== '') {
            html = `${html}<td><img src="${this.imageRight}"></td>`;
        }

        return `${html}</tr></tbody></table></td></tr>`;
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
        reverse = false,
    }) {
        super(id);
        this.variable = variable;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.description = description;
        this.defaultValue = defaultValue;
        this.inputId = `${this.id}-input`;
        this.shallow = shallow;
        this.reverse = reverse;
    }

    toString() {
        if (this.shallow) {
            return `<td id='${this.id}'>${this.getInnerHTML()}<label>${this.description}</label></td>`;
        }
        if (this.reverse) {
            return `<tr id='${this.id}'><td>${this.getInnerHTML()}</td><td><label for='${this.inputId}'>${this.description}</label></td></tr>`;
        }
        return `<tr id='${this.id}'><td><label for='${this.inputId}'>${this.description}:</label></td><td>${this.getInnerHTML()}</td></tr>`;
    }

    getInnerHTML() {
        return '';
    }

    getValue() {
        return this.getFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
    }

    getCurrentValue() {
        return null;
    }

    getInputElement() {
        return document.getElementById(this.inputId);
    }

    saveValue() {
        this.saveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.getCurrentValue());
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
        this.addAfterRefreshHook(() => {
            for (const option of this.options) {
                option.afterRefreshElement();
            }
        });
    }

    addBooleanOption({
        variable,
        description,
        defaultValue = false,
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newOption = new BooleanOption({
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
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
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newOption = new NumericOption({
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            min,
            max,
            step,
            saveFunction,
            getFunction,
        });
        this.options.push(newOption);
        return newOption;
    }

    addSelectOption({
        variable,
        description,
        defaultValue = 0,
        options = [],
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newOption = new SelectOption({
            id: `${this.id}-option-${this.options.length}`,
            variable,
            description,
            defaultValue,
            options,
            saveFunction,
            getFunction,
        });
        this.options.push(newOption);
        return newOption;
    }

    addGroupedOption({
        description,
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newOption = new GroupedOptions({
            id: `${this.id}-option-${this.options.length}`,
            description,
            saveFunction,
            getFunction,
        });
        this.options.push(newOption);
        return newOption;
    }

    toString() {
        // If no options have been defined, then don't add any elements
        if (this.options.length === 0) {
            return `<tr id="${this.id}" style="display: none;"><td><table><tbody></tbody></table></td></tr>`;
        }
        return `<tr id="${this.id}"><td><table><tbody>${this.options.join('')}</tbody></table></td></tr>`;
    }
}

class OptionsBox extends HtmlElement {
    constructor({
        id,
        heading,
        premium = false,
        description = '',
        imageLeft = '',
        imageRight = '',
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
        this.description = new DescriptionElement({
            id: `${this.id}-description`,
            description,
            imageLeft,
            imageRight,
        });
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
        this.addAfterRefreshHook(() => {
            this.optionsGroup.afterRefreshElement();
            this.saveButtonRow.afterRefreshElement();
        });
        this.addAfterRefreshHook(() => {
            this.setFunctions();
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
        this.topBoxes = [];
        this.addAfterRefreshHook(() => {
            for (const box of this.leftBoxes) {
                box.afterRefreshElement();
            }
            for (const box of this.rightBoxes) {
                box.afterRefreshElement();
            }
        });
    }

    addBox({
        heading,
        premium = false,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
        top = false,
    }) {
        let newBox = null;
        if (top) {
            newBox = this.addBoxTop({
                heading,
                premium,
                description,
                imageLeft,
                imageRight,
                saveFunction,
                getFunction,
            });
        } else if (this.leftBoxes.length <= this.rightBoxes.length) {
            newBox = this.addBoxLeft({
                heading,
                premium,
                description,
                imageLeft,
                imageRight,
                saveFunction,
                getFunction,
            });
        } else {
            newBox = this.addBoxRight({
                heading,
                premium,
                description,
                imageLeft,
                imageRight,
                saveFunction,
                getFunction,
            });
        }
        return newBox;
    }

    addBoxTop({
        heading,
        premium = false,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-top-box-${this.topBoxes.length}`,
            heading,
            premium,
            description,
            imageLeft,
            imageRight,
            saveFunction,
            getFunction,
        });
        this.topBoxes.push(newBox);
        this.refreshElement();
        return newBox;
    }

    addBoxLeft({
        heading,
        premium = false,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-left-box-${this.leftBoxes.length}`,
            heading,
            premium,
            description,
            imageLeft,
            imageRight,
            saveFunction,
            getFunction,
        });
        this.leftBoxes.push(newBox);
        this.refreshElement();
        return newBox;
    }

    addBoxRight({
        heading,
        premium = false,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-right-box-${this.rightBoxes.length}`,
            heading,
            premium,
            description,
            imageLeft,
            imageRight,
            saveFunction,
            getFunction,
        });
        this.rightBoxes.push(newBox);
        this.refreshElement();
        return newBox;
    }

    addPremiumBox({
        heading,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        return this.addBox({
            heading,
            premium: true,
            description,
            imageLeft,
            imageRight,
            saveFunction,
            getFunction,
        });
    }

    addPremiumBoxLeft({
        heading,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        return this.addBoxLeft({
            heading,
            premium: true,
            description,
            imageLeft,
            imageRight,
            saveFunction,
            getFunction,
        });
    }

    addPremiumBoxRight({
        heading,
        description = '',
        imageLeft = '',
        imageRight = '',
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
    }) {
        return this.addBoxRight({
            heading,
            premium: true,
            description,
            imageLeft,
            imageRight,
            saveFunction,
            getFunction,
        });
    }

    toString() {
        if (this.content !== null) {
            return this.content;
        }
        return `<table hidden class="messagestyle" id="${this.id}" style="background:url(//static.pardus.at/img/std/bgdark.gif)"><tbody><tr><td><div align="center"><h1>${this.heading}</h1></div><table width="100%" align="center"><tbody><tr><td id="${this.id}-top" colspan="3" valign="top">${this.topBoxes.join('<br><br>')}</td></tr><tr><td id="${this.id}-left" width="350" valign="top">${this.leftBoxes.join('<br><br>')}</td><td width="40"></td><td id="${this.id}-right" width="350" valign="top">${this.rightBoxes.join('<br><br>')}</td></tr></tbody></table></td></tr></tbody></table`;
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

    addListeners() {
        this.getLabel().getElement().addEventListener('click', () => PardusOptionsUtility.setActiveTab(this.id), true);
        window.addEventListener('storage', () => {
            if (window.localStorage.getItem('pardusOptionsOpenTab') === this.id && !this.active) {
                this.setActive();
            }
            if (window.localStorage.getItem('pardusOptionsOpenTab') !== this.id && this.active) {
                this.setInactive();
            }
        });
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

class TabsRow extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
    }

    addLabel({
        label,
    }) {
        this.appendChild(label.toElement());
    }

    toString() {
        return `<tr id="${this.id}"></tr>`;
    }
}

class TabsElement extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
        this.tabsRow = new TabsRow({
            id: `${this.id}-row`,
        });
    }

    addLabel({
        label,
    }) {
        this.tabsRow.addLabel({
            label,
        });
    }

    toString() {
        return `<table id="${this.id}" cellspacing="0" cellpadding="0" border="0" align="left"><tbody>${this.tabsRow}</tbody></table>`;
    }
}

class ContentsArea extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
    }

    addContent({
        content,
    }) {
        this.appendChild(document.createElement('div').appendChild(content.toElement()));
        content.afterRefreshElement();
    }

    toString() {
        return `<tr id="${this.id}"></tr>`;
    }
}

class PardusOptions {
    static init() {
        if (document.getElementById('options-area')) {
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
        pardusMainElement.appendChild(this.getPardusOptionsElement());

        // Add the Pardus options back in
        this.addTab({
            id: 'pardus-default',
            heading: 'Pardus Options',
            content: defaultPardusOptionsContent.outerHTML,
        });

        // Set the Pardus options tab to be active by default
        PardusOptionsUtility.setActiveTab('pardus-default');
    }

    static version() {
        return 1.6;
    }

    static getTabsElement() {
        return new TabsElement({
            id: 'options-tabs',
        });
    }

    static getContentElement() {
        return new ContentsArea({
            id: 'options-content',
        });
    }

    static getPardusOptionsElement() {
        const template = document.createElement('template');
        template.innerHTML = `<table id="options-area"><tbody><tr><td>${this.getTabsElement()}</td></tr>${this.getContentElement()}</tbody></table>`;
        return template.content.firstChild;
    }

    static addTab({
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

        // Check for id uniqueness
        if (document.getElementById(newTab.id)) {
            throw new Error(`Tab '${newTab.id}' already exists!`);
        }

        this.getTabsElement().addLabel({
            label: newTab.getLabel(),
        });

        this.getContentElement().addContent({
            content: newTab.getContent(),
        });

        newTab.addListeners();

        return newTab.getContent();
    }
}

/**
  *  Add the Options object to the page for all scripts to use
  */
if (document.location.pathname === '/options.php') {
    PardusOptions.init();
}
