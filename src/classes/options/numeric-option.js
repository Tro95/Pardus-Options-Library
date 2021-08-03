import AbstractOption from './abstract-option.js';
import PardusOptionsUtility from '../pardus-options-utility.js';

export default class NumericOption extends AbstractOption {
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
