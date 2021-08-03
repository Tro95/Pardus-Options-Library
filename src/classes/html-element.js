export default class HtmlElement {
    constructor(id) {
        // Make sure it is a valid html identifier
        if (!id || id === '') {
            throw new Error('Id cannot be empty.');
        }
        const validIds = RegExp('^[a-zA-Z][\\w:.-]*$');
        if (!validIds.test(id)) {
            throw new Error(`Id '${id}' is not a valid HTML identifier.`);
        }

        this.id = id;
        this.afterRefreshHooks = [];
        this.beforeRefreshHooks = [];
    }

    addEventListener(eventName, listener) {
        if (this.getElement()) {
            this.getElement().addEventListener(eventName, listener, false);
        }

        this.addAfterRefreshHook(() => {
            if (this.getElement()) {
                this.getElement().addEventListener(eventName, listener, false);
            }
        });
    }

    toString() {
        return `<div id='${this.id}'></div>`;
    }

    beforeRefreshElement() {
        for (const func of this.beforeRefreshHooks) {
            func();
        }
    }

    afterRefreshElement(opts = {}) {
        for (const func of this.afterRefreshHooks) {
            func(opts);
        }
    }

    addAfterRefreshHook(func) {
        this.afterRefreshHooks.push(func);
    }

    refreshElement() {
        this.beforeRefreshElement();
        this.getElement().replaceWith(this.toElement());
        this.afterRefreshElement();
    }

    getOffsetTop() {
        let currentOffset = this.getElement().offsetTop + this.getElement().offsetHeight;
        let parent = this.getElement().offsetParent;

        while (parent !== null) {
            currentOffset += parent.offsetTop;
            parent = parent.offsetParent;
        }

        return currentOffset;
    }

    getOffsetLeft() {
        let currentOffset = this.getElement().offsetLeft;
        let parent = this.getElement().offsetParent;

        while (parent !== null) {
            currentOffset += parent.offsetLeft;
            parent = parent.offsetParent;
        }

        return currentOffset;
    }

    getElement() {
        return document.getElementById(this.id);
    }

    toElement() {
        const template = document.createElement('template');
        template.innerHTML = this.toString();
        return template.content.firstChild;
    }

    appendChild(ele) {
        return document.getElementById(this.id).appendChild(ele);
    }

    appendTableChild(ele) {
        return document.getElementById(this.id).firstChild.appendChild(ele);
    }
}
