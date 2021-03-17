class PardusOptionsUtility {
    static defaultSaveFunction(key, value) {
        return GM_setValue(key, value);
    }

    static defaultGetFunction(key, defaultValue = null) {
        return GM_getValue(key, defaultValue);
    }

    static defaultDeleteFunction(key) {
        return GM_deleteValue(key);
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

    /**
     *  Returns the universe-specific value of a variable
     */
    static getVariableValue(variableName, defaultValue = null) {
        return this.defaultGetFunction(this.getVariableName(variableName), defaultValue);
    }

    /**
     *  Sets the universe-specific value of a variable
     */
    static setVariableValue(variableName, value) {
        return this.defaultSaveFunction(this.getVariableName(variableName), value);
    }

    /**
     *  Deletes the universe-specific value of a variable
     */
    static deleteVariableValue(variableName) {
        return this.defaultDeleteFunction(this.getVariableName(variableName));
    }

    static setActiveTab(id) {
        window.localStorage.setItem('pardusOptionsOpenTab', id);
        window.dispatchEvent(new window.Event('storage'));
    }

    static getImagePackUrl() {
        return String(document.querySelector('body').style.backgroundImage).replace(/url\("*|"*\)|[a-z0-9]+\.gif/g, '');
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
        if (this.getElement()) {
            this.getElement().addEventListener(eventName, listener, false);
        }

        this.addAfterRefreshHook(() => {
            if (this.getElement()) {
                this.getElement().addEventListener(eventName, listener, false);
            }
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

    afterRefreshElement(opts = {}) {
        for (const func of this.afterRefreshHooks) {
            func(opts);
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

    getOffsetTop() {
        let currentOffset = this.getElement().offsetTop + this.getElement().offsetHeight;
        let parent = this.getElement().offsetParent;

        while (parent !== null) {
            currentOffset += parent.offsetTop;
            parent = parent.offsetParent;
        }

        return currentOffset;
    }

    getOffsetLeft() {
        let currentOffset = this.getElement().offsetLeft;
        let parent = this.getElement().offsetParent;

        while (parent !== null) {
            currentOffset += parent.offsetLeft;
            parent = parent.offsetParent;
        }

        return currentOffset;
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

class TipBox extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
        this.contents = '';
        this.title = '';
        this.addEventListener('click', () => {
            this.hide();
        });
    }

    setContents({
        contents = '',
        title = '',
    }) {
        this.contents = contents;
        this.title = title;
        this.refreshElement();
    }

    setPosition({
        element,
        position = 'right',
    }) {
        let xOffset = 15;
        let yOffset = -13;

        switch (position) {
            case 'left': {
                xOffset += -220;
                break;
            }

            case 'er': {
                xOffset += 128;
                break;
            }

            case 'lf': {
                xOffset += -160;
                yOffset += -310;
                break;
            }

            default: {
                break;
            }
        }

        this.getElement().style.top = `${element.getOffsetTop() + yOffset}px`;
        this.getElement().style.left = `${element.getOffsetLeft() + xOffset}px`;
    }

    show() {
        this.getElement().removeAttribute('hidden');
    }

    hide() {
        this.getElement().setAttribute('hidden', '');
    }

    toString() {
        return `<div id="${this.id}" hidden="" style="position: absolute; width: 200px; z-index: 100; border: 1pt black solid; background: #000000; padding: 0px;"><table class="messagestyle" style="background:url(${PardusOptionsUtility.getImagePackUrl()}bgd.gif)" width="100%" cellspacing="0" cellpadding="3"><tbody><tr><td style="text-align:left;background:#000000;"><b>${this.title}</b></td></tr><tr><td style="text-align:left;">${this.contents}</td></tr><tr><td height="5"><spacer type="block" width="1" height="1"></spacer></td></tr><tr><td style="text-align:right;background:#31313A;"><b>GNN Library</b><img src="${PardusOptionsUtility.getImagePackUrl()}info.gif" width="10" height="12" border="0"></td></tr></tbody></table></div>`;
    }
}

class InfoElement extends HtmlElement {
    constructor({
        id,
        description,
        title,
        tipBoxPosition = 'right',
    }) {
        super(id);
        this.description = description;
        this.title = title;
        this.tipBoxPosition = tipBoxPosition;

        this.addEventListener('mouseover', () => {
            this.tipBox = PardusOptions.getDefaultTipBox();
            this.tipBox.setContents({
                title: this.title,
                contents: this.description,
            });

            this.tipBox.setPosition({
                element: this,
                position: this.tipBoxPosition,
            });

            this.tipBox.show();
        });

        this.addEventListener('mouseout', () => {
            this.tipBox.hide();
        });
    }

    toString() {
        return `<a id="${this.id}" href="#" onclick="return false;"><img src="${PardusOptionsUtility.getImagePackUrl()}info.gif" class="infoButton" alt=""></a>`;
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
        description = '',
        defaultValue = false,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        shallow = false,
        reverse = false,
        info = null,
    }) {
        super(id);
        this.variable = variable;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.description = description;
        this.info = info;
        this.defaultValue = defaultValue;
        this.inputId = `${this.id}-input`;
        this.shallow = shallow;
        this.reverse = reverse;

        if (this.info !== null) {
            this.infoElement = new InfoElement({
                id: `${this.id}-info`,
                description: this.info.description,
                title: this.info.title,
            });

            this.addAfterRefreshHook(() => {
                this.infoElement.afterRefreshElement();
            });
        } else {
            this.infoElement = '';
        }
    }

    toString() {
        if (this.shallow) {
            return `<td id='${this.id}'>${this.getInnerHTML()}<label>${this.description}</label>${this.infoElement}</td>`;
        }
        if (this.reverse) {
            return `<tr id='${this.id}'><td>${this.getInnerHTML()}</td><td><label for='${this.inputId}'>${this.description}</label>${this.infoElement}</td></tr>`;
        }

        if (this.description === '') {
            return `<tr id='${this.id}'><td col="2">${this.getInnerHTML()}</td></tr>`;
        }

        return `<tr id='${this.id}'><td><label for='${this.inputId}'>${this.description}:</label>${this.infoElement}</td><td>${this.getInnerHTML()}</td></tr>`;
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

    resetValue() {
        this.saveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
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

class TextAreaOption extends AbstractOption {
    constructor({
        id,
        variable,
        description,
        defaultValue = 0,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        info = null,
        rows = 3,
        cols = 65,
    }) {
        super({
            id,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
            info,
        });
        this.rows = rows;
        this.cols = cols;
    }

    getInnerHTML() {
        return `<textarea id="${this.inputId}" autocomplete="off" autocorrect="off" spellcheck="false" ${(this.rows === 0) ? '' : `rows="${this.rows}"`} ${(this.cols === 0) ? '' : `cols="${this.cols}"`} style="font-family: Helvetica, Arial, sans-serif;background-color:#00001C; color:#D0D1D9; font-size:11px;">${this.getValue()}</textarea>`;
    }

    getCurrentValue() {
        return this.getInputElement().value;
    }
}

class KeyDownOption extends AbstractOption {
    constructor(args) {
        super(args);
        this.addAfterRefreshHook(() => {
            document.getElementById(`${this.inputId}-setkey`).addEventListener('click', () => {
                const captureKey = (e) => {
                    console.log(e);
                    this.getInputElement().value = JSON.stringify({
                        code: e.keyCode,
                        key: e.code,
                    });
                    document.getElementById(`${this.inputId}-setkey`).value = 'Set Key';
                    document.getElementById(`${this.inputId}-key`).innerText = this.getCurrentKey();
                };
                document.getElementById(`${this.inputId}-setkey`).value = 'Cancel';
                document.getElementById(`${this.inputId}-key`).innerText = 'Press key...';
                document.addEventListener('keydown', captureKey, {
                    once: true,
                });
                document.getElementById(`${this.inputId}-setkey`).addEventListener('click', () => {
                    document.removeEventListener('keydown', captureKey);
                    this.refreshElement();
                });
            });
        });
    }

    getInnerHTML() {
        let keyPressHtml = `<input id="${this.inputId}" type="text" hidden value='${JSON.stringify(this.getValue())}'>`;
        keyPressHtml += `<table width="100%"><tbody><tr><td align="left" id="${this.inputId}-key">${this.getKey()}</td><td align="right"><input id="${this.inputId}-setkey" type="button" value="Set Key"></td></tr></tbody></table>`;
        return keyPressHtml;
    }

    getKey() {
        return this.getValue().key;
    }

    getKeyCode() {
        return this.getValue().code;
    }

    getCurrentKey() {
        return this.getCurrentValue().key;
    }

    getCurrentCode() {
        return this.getCurrentValue().code;
    }

    getCurrentValue() {
        return JSON.parse(this.getInputElement().value);
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
        info = null,
    }) {
        super({
            id,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
            info,
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
        info = null,
        inheritStyle = false,
        options = [],
    }) {
        super({
            id,
            variable,
            description,
            defaultValue,
            saveFunction,
            getFunction,
            info,
        });
        this.options = options;

        if (inheritStyle) {
            this.addEventListener('change', () => {
                this.updateSelectStyle();
            });
        }
    }

    getInnerHTML() {
        let selectHtml = '';
        const savedValue = this.getValue();
        let hasSelected = false;
        let selectStyle = '';
        for (const option of this.options) {
            const style = (option.style) ? ` style="${option.style}"` : '';
            if (!hasSelected && (option.value === savedValue || (option.default && option.default === true && !savedValue))) {
                selectHtml += `<option value=${option.value}${style} selected>${option.text}</option>`;
                hasSelected = true;
                selectStyle = (option.style) ? ` style="${option.style}"` : '';
            } else {
                selectHtml += `<option value=${option.value}${style}>${option.text}</option>`;
            }
        }

        selectHtml = `<select id="${this.inputId}"${selectStyle}>` + selectHtml;

        return selectHtml;
    }

    updateSelectStyle() {
        const current_style = this.getInputElement().selectedOptions[0].getAttribute('style');
        this.getInputElement().setAttribute('style', current_style);
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
}

class ResetButton extends HtmlElement {
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
        return `<input value="Reset" id="${this.id}" type="button" style="color:${this.colour}">`;
    }

    displayReset() {
        this.getElement().setAttribute('disabled', 'true');
        this.getElement().value = 'Reset';
        this.getElement().setAttribute('style', 'color:green;background-color:silver');
        setTimeout(() => {
            this.getElement().removeAttribute('disabled');
            this.getElement().value = 'Reset';
            if (this.premium) {
                this.getElement().setAttribute('style', 'color:#FFCC11');
            } else {
                this.getElement().removeAttribute('style');
            }
        }, 2000);
    }
}

class SaveButtonRow extends HtmlElement {
    constructor({
        id,
        premium = false,
        resetButton = false,
    }) {
        super(id);
        this.premium = premium;
        this.saveButton = new SaveButton({
            id: `${this.id}-button`,
            premium,
        });

        if (resetButton) {
            this.resetButton = new ResetButton({
                id: `${this.id}-reset-button`,
                premium,
            });
        } else {
            this.resetButton = null;
        }
    }

    toString() {
        return `<tr id="${this.id}"><td align="right">${(this.resetButton) ? `${this.resetButton}&nbsp` : ''}${this.saveButton}</td></tr>`;
    }

    displaySaved() {
        this.saveButton.displaySaved();
    }

    displayReset() {
        if (this.resetButton) {
            this.resetButton.displayReset();
        }
    }

    addSaveEventListener(func) {
        this.saveButton.addEventListener('click', func);
    }

    addResetEventListener(func) {
        if (this.resetButton) {
            this.resetButton.addEventListener('click', func);
        }
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

    addBooleanOption(args) {
        const newOption = new BooleanOption({
            id: `${this.id}-option-${this.options.length}`,
            ...args,
        });
        this.options.push(newOption);
        return newOption;
    }

    addTextAreaOption(args) {
        const newOption = new TextAreaOption({
            id: `${this.id}-option-${this.options.length}`,
            ...args,
        });
        this.options.push(newOption);
        return newOption;
    }

    addNumericOption(args) {
        const newOption = new NumericOption({
            id: `${this.id}-option-${this.options.length}`,
            ...args,
        });
        this.options.push(newOption);
        return newOption;
    }

    addKeyDownOption(args) {
        const newOption = new KeyDownOption({
            id: `${this.id}-option-${this.options.length}`,
            ...args,
        });
        this.options.push(newOption);
        return newOption;
    }

    addSelectOption(args) {
        const newOption = new SelectOption({
            id: `${this.id}-option-${this.options.length}`,
            ...args,
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
        refresh = true,
        resetButton = false,
    }) {
        super(id);
        this.heading = heading;
        this.premium = premium;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.refresh = refresh;
        this.resetButton = resetButton;

        const headerHtml = (premium) ? '<th class="premium">' : '<th>';
        this.frontContainer = `<form id="${this.id}" action="none"><table style="background:url(${PardusOptionsUtility.getImagePackUrl()}bgd.gif)" width="100%" cellpadding="3" align="center"><tbody><tr>${headerHtml}${heading}</th></tr>`;
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
            resetButton,
        });
        this.addAfterRefreshHook((opts) => {
            if (opts.maintainRefreshStatus) {
                return;
            }
            this.refresh = true;
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
            this.saveButtonRow.addSaveEventListener(() => {
                for (const option of this.optionsGroup.options) {
                    option.saveValue();
                }
                this.saveButtonRow.displaySaved();
            });
            this.saveButtonRow.addResetEventListener(() => {
                for (const option of this.optionsGroup.options) {
                    option.resetValue();
                }
                this.saveButtonRow.displayReset();
                this.optionsGroup.refreshElement();
            });
        }
    }

    addSaveEventListener(func) {
        return this.saveButtonRow.addSaveEventListener(func);
    }

    addBooleanOption({
        refresh = this.refresh,
        ...args
    }) {
        const newOption = this.optionsGroup.addBooleanOption(args);
        if (refresh) {
            this.refreshElement();
        }
        return newOption;
    }

    addTextAreaOption({
        refresh = this.refresh,
        ...args
    }) {
        const newOption = this.optionsGroup.addTextAreaOption(args);
        if (refresh) {
            this.refreshElement();
        }
        return newOption;
    }

    addNumericOption({
        refresh = this.refresh,
        ...args
    }) {
        const newOption = this.optionsGroup.addNumericOption(args);
        if (refresh) {
            this.refreshElement();
        }
        return newOption;
    }

    addKeyDownOption({
        refresh = this.refresh,
        ...args
    }) {
        const newOption = this.optionsGroup.addKeyDownOption(args);
        if (refresh) {
            this.refreshElement();
        }
        return newOption;
    }

    addSelectOption({
        refresh = this.refresh,
        ...args
    }) {
        const newOption = this.optionsGroup.addSelectOption(args);
        if (refresh) {
            this.refreshElement();
        }
        return newOption;
    }

    addGroupedOption({
        description,
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
        refresh = this.refresh,
    }) {
        const groupedOptions = {
            description,
            saveFunction,
            getFunction,
        };

        const newOption = this.optionsGroup.addGroupedOption(groupedOptions);
        if (refresh) {
            this.refreshElement();
        }
        return newOption;
    }
}

class OptionsContent extends HtmlElement {
    constructor({
        id,
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        refresh = true,
        active = true,
    }) {
        super(id);
        this.content = content;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.leftBoxes = [];
        this.rightBoxes = [];
        this.topBoxes = [];
        this.refresh = refresh;
        this.active = active;
        this.addAfterRefreshHook((opts) => {
            if (opts.maintainRefreshStatus) {
                return;
            }
            this.refresh = true;
        });
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
        top = false,
        ...args
    }) {
        let newBox = null;
        if (top) {
            newBox = this.addBoxTop(args);
        } else if (this.leftBoxes.length <= this.rightBoxes.length) {
            newBox = this.addBoxLeft(args);
        } else {
            newBox = this.addBoxRight(args);
        }
        return newBox;
    }

    addBoxTop({
        refresh = this.refresh,
        ...args
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-top-box-${this.topBoxes.length}`,
            refresh,
            ...args,
        });

        this.topBoxes.push(newBox);

        if (refresh) {
            this.refreshElement();
        }

        return newBox;
    }

    addBoxLeft({
        refresh = this.refresh,
        ...args
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-left-box-${this.leftBoxes.length}`,
            refresh,
            ...args,
        });

        this.leftBoxes.push(newBox);

        if (refresh) {
            this.refreshElement();
        }

        return newBox;
    }

    addBoxRight({
        refresh = this.refresh,
        ...args
    }) {
        const newBox = new OptionsBox({
            id: `${this.id}-right-box-${this.rightBoxes.length}`,
            refresh,
            ...args,
        });

        this.rightBoxes.push(newBox);

        if (refresh) {
            this.refreshElement();
        }

        return newBox;
    }

    addPremiumBox(args) {
        return this.addBox({
            premium: true,
            ...args,
        });
    }

    addPremiumBoxLeft(args) {
        return this.addBoxLeft({
            premium: true,
            ...args,
        });
    }

    addPremiumBoxRight(args) {
        return this.addBoxRight({
            premium: true,
            ...args,
        });
    }

    toString() {
        if (this.content !== null) {
            return this.content;
        }
        const hidden = this.active ? '' : 'hidden';
        return `<tr id="${this.id}" ${hidden}><td><table width="100%" align="center"><tbody><tr><td id="${this.id}-top" colspan="3" valign="top">${this.topBoxes.join('<br><br>')}${(this.topBoxes.length > 0) ? '<br><br>' : ''}</td></tr><tr><td id="${this.id}-left" width="350" valign="top">${this.leftBoxes.join('<br><br>')}</td><td width="40"></td><td id="${this.id}-right" width="350" valign="top">${this.rightBoxes.join('<br><br>')}</td></tr></tbody></table></td></tr>`;
    }

    setActive() {
        this.active = true;
        this.getElement().removeAttribute('hidden');
    }

    setInactive() {
        this.active = false;
        this.getElement().setAttribute('hidden', '');
    }
}

class TabLabel extends HtmlElement {
    constructor({
        id,
        heading,
        active = false,
        padding = '0px',
    }) {
        super(id);
        this.padding = padding;
        this.heading = heading;
        this.active = active;
        this.addEventListener('mouseover', () => {
            if (this.active) {
                this.getElement().style.cursor = 'default';
            } else {
                this.getElement().style.backgroundImage = `url(${PardusOptionsUtility.getImagePackUrl()}tabactive.png)`;
                this.getElement().style.cursor = 'default';
            }
        });
        this.addEventListener('mouseout', () => {
            if (!this.active) {
                this.getElement().style.backgroundImage = `url(${PardusOptionsUtility.getImagePackUrl()}tab.png)`;
                this.getElement().style.cursor = 'default';
            }
        });
    }

    toString() {
        const imageUrl = (this.active) ? 'tabactive' : 'tab';
        return `<td id="${this.id}" style="background: transparent url(&quot;${PardusOptionsUtility.getImagePackUrl()}${imageUrl}.png&quot;) no-repeat scroll 0% 0%; background-size: cover; cursor: default; padding-left: ${this.padding}; padding-right: ${this.padding}" class="tabcontent">${this.heading}</td>`;
    }

    setActive() {
        this.getElement().style.backgroundImage = `url('${PardusOptionsUtility.getImagePackUrl()}tabactive.png')`;
        this.active = true;
    }

    setInactive() {
        this.getElement().style.backgroundImage = `url('${PardusOptionsUtility.getImagePackUrl()}tab.png')`;
        this.active = false;
    }
}

class SubTab {
    constructor({
        id,
        label,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        refresh = true,
        active = false,
        padding,
    }) {
        this.id = id;
        this.active = active;
        this.label = new TabLabel({
            id: `${this.id}-label`,
            heading: label,
            active: this.active,
            padding,
        });
        this.content = new OptionsContent({
            id: `${this.id}-content`,
            saveFunction,
            getFunction,
            refresh,
            active: this.active,
        });
    }

    setActive() {
        if (this.active === true) {
            return;
        }
        this.active = true;
        this.label.setActive();
        this.content.setActive();
    }

    setInactive() {
        if (this.active === false) {
            return;
        }
        this.active = false;
        this.label.setInactive();
        this.content.setInactive();
    }

    afterRefreshElement(opts) {
        this.label.afterRefreshElement(opts);
        this.content.afterRefreshElement(opts);
    }

    getLabel() {
        return this.label;
    }

    getContent() {
        return this.content;
    }

    toString() {
        return this.content.toString();
    }
}

class VersionRow extends HtmlElement {
    constructor({
        id,
    }) {
        super(id);
    }

    toString() {
        return `<tr id="${this.id}"><td align="right" style="font-size:11px;color:#696988;padding-right:7px;padding-top:5px">Version ${GM_info.script.version}</td></tr>`;
    }
}

class TabContent extends HtmlElement {
    constructor({
        id,
        heading,
        defaultLabel = 'Default tab',
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        refresh = true,
    }) {
        super(id);
        this.heading = heading;
        this.content = content;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.subTabsRow = new TabsRow({
            id: `${this.id}-tabsrow`,
        });
        this.refresh = refresh;
        this.subTabs = [];
        this.defaultTab = this.addSubTab({
            label: defaultLabel,
            saveFunction: this.saveFunction,
            getFunction: this.getFunction,
            refresh: false,
            active: true,
        });
        this.versionRow = new VersionRow({
            id: `${this.id}-versionrow`,
        });
        this.addAfterRefreshHook((opts) => {
            if (opts.maintainRefreshStatus) {
                return;
            }
            this.refresh = true;
        });
        this.addAfterRefreshHook((opts) => {
            if (!this.refresh && opts.maintainRefreshStatus) {
                return;
            }
            for (const subTab of this.subTabs) {
                subTab.afterRefreshElement(opts);
            }
        });
    }

    addSubTab({
        label,
        saveFunction = this.saveFunction,
        getFunction = this.getFunction,
        refresh = this.refresh,
        active = false,
        padding,
    }) {
        const newSubTab = new SubTab({
            id: `${this.id}-subtab-${this.subTabs.length}`,
            label,
            saveFunction,
            getFunction,
            refresh,
            active,
            padding,
        });

        const newSubTabContent = newSubTab.getContent();
        const newSubTabLabel = newSubTab.getLabel();

        this.subTabsRow.addLabel({
            label: newSubTabLabel,
        });

        this.subTabs.push(newSubTab);

        newSubTabLabel.addEventListener('click', () => {
            this.setActiveSubTab(newSubTab.id);
        });

        if (refresh) {
            this.refreshElement();
        }

        return newSubTabContent;
    }

    setActiveSubTab(subTabId) {
        for (const subTab of this.subTabs) {
            if (subTab.id === subTabId) {
                subTab.setActive();
            } else {
                subTab.setInactive();
            }
        }
    }

    addBox(args) {
        return this.defaultTab.addBox(args);
    }

    addBoxTop(args) {
        return this.defaultTab.addBoxTop(args);
    }

    addBoxLeft(args) {
        return this.defaultTab.addBoxLeft(args);
    }

    addBoxRight(args) {
        return this.defaultTab.addBoxRight(args);
    }

    addPremiumBox(args) {
        return this.defaultTab.addPremiumBox(args);
    }

    addPremiumBoxLeft(args) {
        return this.defaultTab.addPremiumBoxLeft(args);
    }

    addPremiumBoxRight(args) {
        return this.defaultTab.addPremiumBoxRight(args);
    }

    setActive() {
        this.getElement().removeAttribute('hidden');
    }

    setInactive() {
        this.getElement().setAttribute('hidden', '');
    }

    toString() {
        if (this.content !== null) {
            return this.content;
        }
        const hidden = (this.subTabs.length > 1) ? '' : 'hidden';
        const innerStyle = (this.subTabs.length > 1) ? 'class="tabstyle"' : '';
        return `<table id="${this.id}" hidden class="tabstyle" style="background:url(${PardusOptionsUtility.getImagePackUrl()}bgdark.gif)" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><div align="center"><h1>${this.heading}</h1></div></td></tr><tr><td><table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><table cellspacing="0" cellpadding="0" border="0" ${hidden}><tbody>${this.subTabsRow}</tbody></table></td></tr><tr><td><table ${innerStyle} cellspacing="0" cellpadding="0" border="0"><tbody>${this.subTabs.join('')}</tbody></table></td></tr></tbody></table></td></tr>${this.versionRow}</tbody></table>`;
    }
}

class Tab {
    constructor({
        id,
        heading,
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        refresh = true,
        defaultLabel,
    }) {
        this.id = id;
        this.heading = heading;
        this.content = new TabContent({
            id: `options-content-${this.id}`,
            heading,
            content,
            saveFunction,
            getFunction,
            refresh,
            defaultLabel,
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
        this.getLabel().addEventListener('click', () => PardusOptionsUtility.setActiveTab(this.id), true);
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
        hidden = false,
    }) {
        super(id);
        this.hidden = hidden;
        this.labels = [];
        this.addAfterRefreshHook(() => {
            for (const label of this.labels) {
                label.afterRefreshElement();
            }
        });
    }

    addLabel({
        label,
    }) {
        this.labels.push(label);
        if (this.getElement()) {
            this.appendChild(label.toElement());
            label.afterRefreshElement();
        }
    }

    show() {
        this.hidden = false;
        this.refreshElement();
    }

    hide() {
        this.hidden = true;
        this.refreshElement();
    }

    toString() {
        if (this.hidden) {
            return `<tr id="${this.id}" cellspacing="0" cellpadding="0" border="0" hidden="">${this.labels.join('')}</tr>`;
        }
        return `<tr id="${this.id}" cellspacing="0" cellpadding="0" border="0">${this.labels.join('')}</tr>`;
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
        content.afterRefreshElement({
            maintainRefreshStatus: true,
        });
    }

    toString() {
        return `<tr id="${this.id}" cellspacing="0" cellpadding="0" border="0"></tr>`;
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
        defaultPardusOptionsContent.setAttribute('class', 'tabstyle');
        defaultPardusOptionsContent.remove();

        // Add this object to the DOM within the main containing element
        pardusMainElement.appendChild(this.getPardusOptionsElement());

        const defaultTipBox = this.createDefaultTipBox();
        pardusMainElement.appendChild(defaultTipBox.toElement());

        // Add the Pardus options back in
        this.addTab({
            id: 'pardus-default',
            heading: 'Pardus Options',
            content: defaultPardusOptionsContent.outerHTML,
            refresh: false,
        });

        // Set the Pardus options tab to be active by default
        PardusOptionsUtility.setActiveTab('pardus-default');
    }

    static version() {
        return 1.6;
    }

    static createDefaultTipBox() {
        return new TipBox({
            id: 'options-default-tip-box',
        });
    }

    static getDefaultTipBox() {
        const defaultTipBox = this.createDefaultTipBox();
        defaultTipBox.refreshElement();
        return defaultTipBox;
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
        template.innerHTML = `<table id="options-area" cellspacing="0" cellpadding="0" border="0"><tbody><tr cellspacing="0" cellpadding="0" border="0"><td>${this.getTabsElement()}</td></tr>${this.getContentElement()}</tbody></table>`;
        return template.content.firstChild;
    }

    static addTab({
        id,
        heading,
        content = null,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        refresh = true,
        defaultLabel,
    }) {
        const newTab = new Tab({
            id,
            heading,
            content,
            saveFunction,
            getFunction,
            refresh,
            defaultLabel,
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
