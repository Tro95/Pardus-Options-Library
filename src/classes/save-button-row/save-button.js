import HtmlElement from '../html-element.js';

export default class SaveButton extends HtmlElement {
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
        return `<input value="Save" id="${this.id}" type="button" style="color:${this.colour}">`;
    }

    displaySaved() {
        this.getElement().setAttribute('disabled', 'true');
        this.getElement().value = 'Saved';
        this.getElement().setAttribute('style', 'color:green;background-color:silver');
        setTimeout(() => {
            this.getElement().removeAttribute('disabled');
            this.getElement().value = 'Save';
            if (this.premium) {
                this.getElement().setAttribute('style', 'color:#FFCC11');
            } else {
                this.getElement().removeAttribute('style');
            }
        }, 2000);
    }
}
