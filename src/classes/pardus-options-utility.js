/**
 * @module PardusOptionsUtility
 */
export default class PardusOptionsUtility {
    /**
     *  @ignore
     */
    static defaultSaveFunction(key, value) {
        return GM_setValue(key, value);
    }

    /**
     *  @ignore
     */
    static defaultGetFunction(key, defaultValue = null) {
        return GM_getValue(key, defaultValue);
    }

    /**
     *  @ignore
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
     *  @ignore
     */
    static getVariableName(variableName) {
        return `${this.getUniverse()}_${variableName}`;
    }

    /**
     *  Returns the universe-specific value of a variable
     *  @param {string} variableName The name of the universe-specific variable to retrieve
     *  @param {*} [defaultValue=null] A default value to return if the universe-specific variable has never been set.
     *  @returns {*} Value of the universe-specific value, or if not set, the default value.
     */
    static getVariableValue(variableName, defaultValue = null) {
        return this.defaultGetFunction(this.getVariableName(variableName), defaultValue);
    }

    /**
     *  Sets the universe-specific value of a variable
     *  @param {string} variableName The name of the universe-specific variable to set
     *  @param {*} value The value to set for the universe-specific variable.
     */
    static setVariableValue(variableName, value) {
        return this.defaultSaveFunction(this.getVariableName(variableName), value);
    }

    /**
     *  Deletes the universe-specific value of a variable
     *  @param {string} variableName The name of the universe-specific variable to delete
     */
    static deleteVariableValue(variableName) {
        return this.defaultDeleteFunction(this.getVariableName(variableName));
    }

    /**
     *  @ignore
     */
    static setActiveTab(id) {
        window.localStorage.setItem('pardusOptionsOpenTab', id);
        window.dispatchEvent(new window.Event('storage'));
    }

    /**
     *  Returns a path to the user's image pack to use as a base for relative image URLs
     *  @returns {string} Path to the user's iamge pack
     */
    static getImagePackUrl() {
        const defaultImagePackUrl = '//static.pardus.at/img/std/';
        const imagePackUrl = String(document.querySelector('body').style.backgroundImage).replace(/url\("*|"*\)|[a-z0-9]+\.gif/g, '');

        return imagePackUrl !== '' ? imagePackUrl : defaultImagePackUrl;
    }

    /**
     *  @ignore
     */
    static addGlobalListeners() {
        EventTarget.prototype.addPardusKeyDownListener = function addPardusKeyDownListener(pardusVariable, defaultValue, listener, options = false) {
            const pardusVariableKey = PardusOptionsUtility.getVariableValue(pardusVariable, defaultValue);

            if (!pardusVariableKey) {
                throw new Error(`No Pardus variable ${pardusVariable} defined!`);
            }

            if (Object.hasOwn(pardusVariableKey, 'disabled')) {
                return;
            }

            if (!this.pardusListeners) {
                this.pardusListeners = [];
            }

            // Prevent duplicates from being added
            if (this.pardusListeners.includes(`${pardusVariableKey.code}${pardusVariable}`)) {
                return;
            }

            this.pardusListeners.push(`${pardusVariableKey.code}${pardusVariable}`);

            const eventListener = (event) => {
                if (event.isComposing || event.keyCode === 229 || event.repeat) {
                    return;
                }

                if (event.keyCode !== pardusVariableKey.code) {
                    return;
                }

                listener(event);
            };

            this.addEventListener('keydown', eventListener, options);
        };
    }
}
