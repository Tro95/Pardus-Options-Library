import AbstractButton from '../abstract/abstract-button.js';

export default class ResetButton extends AbstractButton {
    constructor({
        id,
        premium = false,
    }) {
        super({
            id,
            premium,
            actionText: 'Reset',
            actionPerformedText: 'Reset',
        });
    }

    displayReset() {
        this.displayClicked();
    }
}
