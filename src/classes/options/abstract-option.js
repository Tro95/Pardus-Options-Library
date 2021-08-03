import HtmlElement from '../html-element.js';
import InfoElement from '../info-element.js';
import PardusOptionsUtility from '../pardus-options-utility.js';

export default class AbstractOption extends HtmlElement {
    constructor({
        id,
        variable,
        description = '',
        defaultValue = false,
        saveFunction = PardusOptionsUtility.defaultSaveFunction,
        getFunction = PardusOptionsUtility.defaultGetFunction,
        shallow = false,
        reverse = false,
        info = null,
    }) {
        super(id);
        this.variable = variable;
        this.saveFunction = saveFunction;
        this.getFunction = getFunction;
        this.description = description;
        this.info = info;
        this.defaultValue = defaultValue;
        this.inputId = `${this.id}-input`;
        this.shallow = shallow;
        this.reverse = reverse;

        if (this.info !== null) {
            this.infoElement = new InfoElement({
                id: `${this.id}-info`,
                description: this.info.description,
                title: this.info.title,
            });

            this.addAfterRefreshHook(() => {
                this.infoElement.afterRefreshElement();
            });
        } else {
            this.infoElement = '';
        }
    }

    toString() {
        if (this.shallow) {
            return `<td id='${this.id}'>${this.getInnerHTML()}<label>${this.description}</label>${this.infoElement}</td>`;
        }
        if (this.reverse) {
            return `<tr id='${this.id}'><td>${this.getInnerHTML()}</td><td><label for='${this.inputId}'>${this.description}</label>${this.infoElement}</td></tr>`;
        }

        if (this.description === '') {
            return `<tr id='${this.id}'><td col="2">${this.getInnerHTML()}</td></tr>`;
        }

        return `<tr id='${this.id}'><td><label for='${this.inputId}'>${this.description}:</label>${this.infoElement}</td><td>${this.getInnerHTML()}</td></tr>`;
    }

    getInnerHTML() {
        return '';
    }

    getValue() {
        return this.getFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
    }

    getCurrentValue() {
        return null;
    }

    getInputElement() {
        return document.getElementById(this.inputId);
    }

    resetValue() {
        this.saveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.defaultValue);
    }

    saveValue() {
        this.saveFunction(`${PardusOptionsUtility.getVariableName(this.variable)}`, this.getCurrentValue());
    }
}
