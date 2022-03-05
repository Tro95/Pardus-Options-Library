import HtmlElement from '../html-element.js';
import PresetRow from './preset-row.js';

export default class Presets extends HtmlElement {
    constructor({
        id,
        premium = false,
        presets = 0,
    }) {
        super(id);
        this.premium = premium;
        this.presets = [];
        for (let i = 0; i < presets; i += 1) {
            this.presets.push(new PresetRow({
                id: `${this.id}-preset-row-${i}`,
                premium,
                presetNumber: i + 1,
            }));
        }
    }

    toString() {
        if (this.presets.length === 0) {
            return '';
        }

        let html = `<tr id="${this.id}"><td><table width="100%">`;

        for (const presetRow of this.presets) {
            html += presetRow;
        }

        return `${html}</table></td></tr>`;
    }

    setFunctions(options) {
        for (const presetRow of this.presets) {
            presetRow.setFunctions(options);
        }
    }
}
