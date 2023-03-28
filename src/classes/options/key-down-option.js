import AbstractOption from './abstract-option.js';

export default class KeyDownOption extends AbstractOption {
    constructor(args) {
        super(args);
        this.addAfterRefreshHook(() => {
            document.getElementById(`${this.inputId}-setkey`).addEventListener('click', () => {
                const captureKey = (e) => {
                    console.log(e);
                    this.getInputElement().value = JSON.stringify({
                        code: e.keyCode,
                        key: e.code,
                        description: e.key,
                    });
                    document.getElementById(`${this.inputId}-setkey`).value = 'Set Key';
                    document.getElementById(`${this.inputId}-key`).innerText = this.getCurrentKeyDescription();
                };
                document.getElementById(`${this.inputId}-setkey`).value = 'Cancel';
                document.getElementById(`${this.inputId}-key`).innerText = 'Press key...';
                document.addEventListener('keydown', captureKey, {
                    once: true,
                });
                document.getElementById(`${this.inputId}-setkey`).addEventListener('click', () => {
                    document.removeEventListener('keydown', captureKey);
                    this.refreshElement();
                });
            });
        });
    }

    getInnerHTML() {
        let keyPressHtml = `<input id="${this.inputId}" type="text" hidden value='${JSON.stringify(this.getValue())}'>`;
        keyPressHtml += `<table width="100%"><tbody><tr><td align="left" id="${this.inputId}-key">${this.getKeyDescription()}</td><td align="right"><input id="${this.inputId}-setkey" type="button" value="Set Key"></td></tr></tbody></table>`;
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
