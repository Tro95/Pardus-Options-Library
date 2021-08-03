import HtmlElement from '../html-element.js';
import SaveButton from './save-button.js';
import ResetButton from './reset-button.js';

export default class SaveButtonRow extends HtmlElement {
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
