import AbstractOption from './abstract-option.js';
import PardusOptionsUtility from '../pardus-options-utility.js';

export default class TextAreaOption extends AbstractOption {
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
