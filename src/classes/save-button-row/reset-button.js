import HtmlElement from '../html-element.js';

export default class ResetButton extends HtmlElement {
    constructor({
        id,
        premium = false,
    }) {
        super(id);
        this.premium = premium;

        if (this.premium) {
            this.colour = '#FFCC11';
        } else {
            this.colour = '#D0D1D9';
        }
    }

    toString() {
        return `<input value="Reset" id="${this.id}" type="button" style="color:${this.colour}">`;
    }

    displayReset() {
        this.getElement().setAttribute('disabled', 'true');
        this.getElement().value = 'Reset';
        this.getElement().setAttribute('style', 'color:green;background-color:silver');
        setTimeout(() => {
            this.getElement().removeAttribute('disabled');
            this.getElement().value = 'Reset';
            if (this.premium) {
                this.getElement().setAttribute('style', 'color:#FFCC11');
            } else {
                this.getElement().removeAttribute('style');
            }
        }, 2000);
    }
}
