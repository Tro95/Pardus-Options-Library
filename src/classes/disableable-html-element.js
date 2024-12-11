import HtmlElement from './html-element.js';

/**
 * @class DisableableHtmlElement
 * @extends HtmlElement
 * @abstract
 */
export default class DisableableHtmlElement extends HtmlElement {
    /**
     * Create an HTML element that can be disabled
     * @param {object} params Object containing parameters
     * @param {string} params.id The id of the string. Must be unique.
     * @param {boolean} params.disabled Whether the element is disabled or not
     */
    constructor({
        id,
        disabled = false,
    }) {
        super(id);
        this.disabled = disabled;
    }

    /**
     * Disables this element and all nested elements
     * @function DisableableHtmlElement#disable
     */
    disable() {
        this.setDisabled(true);
        this.refreshElement();
    }

    /**
     * Enables this element and all nested elements
     * @function DisableableHtmlElement#enable
     */
    enable() {
        this.setDisabled(false);
        this.refreshElement();
    }

    /**
     * Allows disabling or enabling ths element and all nested elements without refreshing
     * @function DisableableHtmlElement#setDisabled
     */
    setDisabled(disabled = false) {
        this.disabled = disabled;
    }
}
