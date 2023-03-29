import AbstractButton from '../abstract/abstract-button.js';

export default class SaveButton extends AbstractButton {
    constructor({
        id,
        premium = false,
    }) {
        super({
            id,
            premium,
            actionText: 'Save',
            actionPerformedText: 'Saved',
        });
    }

    displaySaved() {
        this.displayClicked();
    }
}
