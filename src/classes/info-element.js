import HtmlElement from './html-element.js';
import PardusOptionsUtility from './pardus-options-utility.js';
import PardusOptions from './pardus-options.js';

export default class InfoElement extends HtmlElement {
    constructor({
        id,
        description,
        title,
        tipBoxPosition = 'right',
    }) {
        super(id);
        this.description = description;
        this.title = title;
        this.tipBoxPosition = tipBoxPosition;

        this.addEventListener('mouseover', () => {
            // eslint-disable-next-line import/no-cycle
            this.tipBox = PardusOptions.getDefaultTipBox();
            this.tipBox.setContents({
                title: this.title,
                contents: this.description,
            });

            this.tipBox.setPosition({
                element: this,
                position: this.tipBoxPosition,
            });

            this.tipBox.show();
        });

        this.addEventListener('mouseout', () => {
            this.tipBox.hide();
        });
    }

    toString() {
        return `<a id="${this.id}" href="#" onclick="return false;"><img src="${PardusOptionsUtility.getImagePackUrl()}info.gif" class="infoButton" alt=""></a>`;
    }
}
