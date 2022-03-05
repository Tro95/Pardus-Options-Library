import AbstractButton from './abstract-button.js';

export default class LoadButton extends AbstractButton {
    constructor({
        id,
        premium = false,
    }) {
        super({
            id,
            premium,
            actionText: 'Load',
            actionPerformedText: 'Loaded',
        });
    }

    displayLoaded() {
        this.displayClicked();
    }
}
