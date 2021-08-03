import AbstractOption from './abstract-option.js';

export default class BooleanOption extends AbstractOption {
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
