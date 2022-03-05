import HtmlElement from '../html-element.js';
import InfoElement from '../info-element.js';
import PardusOptionsUtility from '../pardus-options-utility.js';

/**
 * @class AbstractOption
 * @extends HtmlElement
 * @abstract
 */
export default class AbstractOption extends HtmlElement {
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

    /**
     * Get the inner HTML of the options element
     * @abstract
     * @function AbstractOption#getInnerHTML
     * @returns {string} Inner HTML of the options element
     */
    getInnerHTML() {
        return '';
    }

    /**
     * Gets the last-saved value of the options element
     * @function AbstractOption#getValue
     * @returns {type} Last-saved value of the options element
     */
    getValue(overrideGetFunction = null) {
        if (overrideGetFunction && typeof overrideGetFunction === 'function') {
            return overrideGetFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
        }

        return this.getFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
    }

    /**
     * Gets the current value of the options element
     * @abstract
     * @function AbstractOption#getCurrentValue
     * @returns {type} Value of the options element
     */
    getCurrentValue() {
        return null;
    }

    /**
     * Gets the input element for the option
     * @function AbstractOption#getInputElement
     * @returns {object} Input element
     */
    getInputElement() {
        return document.getElementById(this.inputId);
    }

    /**
     * Resets the saved value of the options element to its default
     * @function AbstractOption#resetValue
     */
    resetValue() {
        this.saveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
    }

    /**
     * Saves the current value of the options element
     * @function AbstractOption#saveValue
     */
    saveValue(overrideSaveFunction = null) {
        if (overrideSaveFunction && typeof overrideSaveFunction === 'function') {
            overrideSaveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.getCurrentValue());
        } else {
            this.saveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.getCurrentValue());
        }
    }

    loadValue(value) {
        this.getInputElement().value = value;
        this.saveValue();
    }
}
