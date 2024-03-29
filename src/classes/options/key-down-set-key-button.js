import AbstractToggleButton from '../abstract/abstract-toggle-button.js';

export default class SetKeyButton extends AbstractToggleButton {
    constructor({
        id,
        premium = false,
        disabled = false,
    }) {
        super({
            id,
            premium,
            disabled,
            actionText: 'Set Key',
            toggleText: 'Cancel',
            styleExtra: 'width:58px;',
        });
    }
}
