import HtmlElement from '../html-element.js';
import PardusOptionsUtility from '../pardus-options-utility.js';

export default class PresetLabel extends HtmlElement {
    constructor({
        id,
        defaultValue = '',
    }) {
        super(id);
        this.defaultValue = defaultValue;
    }

    toString() {
        return `<input id="${this.id}" type="text" value="${this.getValue()}"></input>`;
    }

    save() {
        PardusOptionsUtility.defaultSaveFunction(`${PardusOptionsUtility.getVariableName(this.id)}`, this.getCurrentValue());
    }

    hasValue() {
        if (!PardusOptionsUtility.defaultGetFunction(`${PardusOptionsUtility.getVariableName(this.id)}`, false)) {
            return false;
        }

        return true;
    }

    /**
     * Gets the input element for the option
     * @function AbstractOption#getInputElement
     * @returns {object} Input element
     */
    getInputElement() {
        return document.getElementById(this.id);
    }

    getCurrentValue() {
        return this.getInputElement().value;
    }

    getValue() {
        return PardusOptionsUtility.defaultGetFunction(`${PardusOptionsUtility.getVariableName(this.id)}`, this.defaultValue);
    }
}
