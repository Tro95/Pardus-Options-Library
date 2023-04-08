import AbstractOption from './abstract-option.js';
import SetKeyButton from './key-down-set-key-button.js';

export default class KeyDownOption extends AbstractOption {
    constructor(args) {
        super(args);
        this.setKeyButton = new SetKeyButton({
            id: `${this.id}-setkey`,
        });
        this.boundInitialSetKeyListener = this.initialSetKeyListener.bind(this);
        this.addAfterRefreshHook(this.boundInitialSetKeyListener);
    }

    initialSetKeyListener(ephemeral = true) {
        this.setKeyButton.addEventListener('click', this.setKeyListener.bind(this), {
            once: true,
            ephemeral,
        });
    }

    setKeyListener() {
        this.setKeyButton.displayClicked(true);
        document.getElementById(`${this.inputId}-key`).value = '_';
        document.getElementById(`${this.inputId}-key`).style.color = 'lime';

        this.boundCaptureKeyListener = this.captureKeyListener.bind(this);
        this.boundCancelHandler = this.cancelHandler.bind(this);

        document.addEventListener('keydown', this.boundCaptureKeyListener, {
            once: true,
            ephemeral: true,
        });
        this.setKeyButton.addEventListener('click', this.boundCancelHandler, {
            once: true,
            ephemeral: true,
        });
    }

    captureKeyListener(event) {
        this.getInputElement().value = JSON.stringify({
            code: event.keyCode,
            key: event.code,
            description: event.key,
        });
        this.setKeyButton.displayClicked(false);
        document.getElementById(`${this.inputId}-key`).value = this.getCurrentKeyDescription();
        document.getElementById(`${this.inputId}-key`).style.color = '#D0D1D9';
        this.setKeyButton.removeEventListener('click', this.boundCancelHandler);
        this.boundInitialSetKeyListener();
    }

    cancelHandler() {
        this.setKeyButton.displayClicked(false);
        document.removeEventListener('keydown', this.boundCaptureKeyListener);
        this.refreshElement();
    }

    getInnerHTML() {
        let keyPressHtml = `<input id="${this.inputId}" type="text" hidden value='${JSON.stringify(this.getValue())}'>`;
        keyPressHtml += `<table width="100%"><tbody><tr><td align="left"><input id="${this.inputId}-key" type="text" cols="1" maxlength="1" readonly value="${this.getKeyDescription()}" style="width: 20px;padding: 2px;text-align: center;margin: 2px 7px 2px;" style="${this.style}" ${this.disabled ? 'disabled' : ''}/></td><td align="right">${this.setKeyButton}</td></tr></tbody></table>`;
        return keyPressHtml;
    }

    getKey() {
        return this.getValue().key;
    }

    getKeyDescription() {
        return this.getValue().description;
    }

    getKeyCode() {
        return this.getValue().code;
    }

    getCurrentKey() {
        return this.getCurrentValue().key;
    }

    getCurrentKeyDescription() {
        return this.getCurrentValue().description;
    }

    getCurrentCode() {
        return this.getCurrentValue().code;
    }

    getCurrentValue() {
        return JSON.parse(this.getInputElement().value);
    }
}
