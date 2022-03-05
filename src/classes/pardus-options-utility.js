/**
 * @module PardusOptionsUtility
 */
export default class PardusOptionsUtility {
    /**
     * @ignore
     */
    static defaultSaveFunction(key, value) {
        return GM_setValue(key, value);
    }

    /**
     * @ignore
     */
    static defaultGetFunction(key, defaultValue = null) {
        return GM_getValue(key, defaultValue);
    }

    /**
     * @ignore
     */
    static defaultDeleteFunction(key) {
        return GM_deleteValue(key);
    }

    /**
     *  Returns the active universe
     *  @returns {string} One of 'orion', 'artemis', or 'pegasus'
     *  @throws Will throw an error if no universe could be determined.
     */
    static getUniverse() {
        switch (document.location.hostname) {
            case 'orion.pardus.at':
                return 'orion';
            case 'artemis.pardus.at':
                return 'artemis';
            case 'pegasus.pardus.at':
                return 'pegasus';
            default:
                throw new Error('Unable to determine universe');
        }
    }

    /**
     *  Returns the universe-specific name of a variable
     */
    static getVariableName(variableName) {
        return `${this.getUniverse()}_${variableName}`;
    }

    /**
     *  Returns the universe-specific value of a variable
     */
    static getVariableValue(variableName, defaultValue = null) {
        return this.defaultGetFunction(this.getVariableName(variableName), defaultValue);
    }

    /**
     *  Sets the universe-specific value of a variable
     */
    static setVariableValue(variableName, value) {
        return this.defaultSaveFunction(this.getVariableName(variableName), value);
    }

    /**
     *  Deletes the universe-specific value of a variable
     */
    static deleteVariableValue(variableName) {
        return this.defaultDeleteFunction(this.getVariableName(variableName));
    }

    static setActiveTab(id) {
        window.localStorage.setItem('pardusOptionsOpenTab', id);
        window.dispatchEvent(new window.Event('storage'));
    }

    static getImagePackUrl() {
        return String(document.querySelector('body').style.backgroundImage).replace(/url\("*|"*\)|[a-z0-9]+\.gif/g, '');
    }
}
