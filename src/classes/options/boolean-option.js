import AbstractOption from './abstract-option.js';

/**
 * @class BooleanOption
 * @extends AbstractOption
 */
export default class BooleanOption extends AbstractOption {
    getInnerHTML() {
        let checkedStatus = '';
        if (this.getValue() === true) {
            checkedStatus = ' checked';
        }
        return `<input id="${this.inputId}" type="checkbox"${checkedStatus} style="${this.style}" ${this.disabled ? 'disabled' : ''}>`;
    }

    /**
     * Gets the current value of the boolean options element
     * @function BooleanOption#getCurrentValue
     * @returns {boolean} Value of the boolean options element
     */
    getCurrentValue() {
        return this.getInputElement().checked;
    }
}
