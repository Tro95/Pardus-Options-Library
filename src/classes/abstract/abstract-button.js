import HtmlElement from '../html-element.js';

export default class AbstractButton extends HtmlElement {
    constructor({
        id,
        premium = false,
        actionText = '',
        actionPerformedText = '',
    }) {
        super(id);
        this.premium = premium;

        if (this.premium) {
            this.colour = '#FFCC11';
        } else {
            this.colour = '#D0D1D9';
        }

        this.actionText = actionText;
        this.actionPerformedText = actionPerformedText;
        this.disabled = false;
        this.style = `color: ${this.colour}`;
    }

    toString() {
        return `<input value="${this.actionText}" id="${this.id}" type="button" style="${this.style}" ${this.disabled ? 'disabled' : ''}>`;
    }

    setActionText(actionText = '', actionPerformedText = '') {
        this.actionText = actionText;
        this.actionPerformedText = actionPerformedText;
        this.refreshElement();
    }

    displayClicked() {
        this.getElement().setAttribute('disabled', 'true');
        this.getElement().value = this.actionPerformedText;
        this.getElement().setAttribute('style', 'color:green;background-color:silver');
        setTimeout(() => {
            this.getElement().removeAttribute('disabled');
            this.getElement().value = this.actionText;
            if (this.premium) {
                this.getElement().setAttribute('style', 'color:#FFCC11');
            } else {
                this.getElement().removeAttribute('style');
            }
        }, 2000);
    }

    disable() {
        this.disabled = true;
        this.style = 'color: #B5B5B5;background-color: #CCCCCC;';
        if (this.getElement()) {
            this.getElement().setAttribute('disabled', 'true');
            this.getElement().setAttribute('style', this.style);
        }
    }

    enable() {
        this.disabled = false;
        this.style = `color: ${this.colour}`;
        if (this.getElement()) {
            this.getElement().removeAttribute('disabled');
            this.getElement().setAttribute('style', this.style);
        }
    }
}
