import AbstractButton from '../abstract/abstract-button.js';

export default class SetKeyButton extends AbstractButton {
    constructor({
        id,
        premium = false,
    }) {
        super({
            id,
            premium,
            actionText: 'Set Key',
        });
    }

    displayClicked(settingKey = true) {
        if (settingKey) {
            this.setActionText('Cancel');
        } else {
            this.setActionText('Set Key');
        }
    }
}
