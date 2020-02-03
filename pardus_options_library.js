var Options = (function() {
    'use strict';

    // Required for compatibility
    var version = 1.2;

    var tabs = [];
    var tabs_element = null;
    var content_element = null;

    function get_version() {
        return version;
    }

    function initialise() {

        // HTML for both the options tabs and the content area
        var options_html = `<table id="options-area"><tbody><tr><td><table id="options-tabs" width="96" cellspacing="0" cellpadding="0" border="0" align="left"><tbody><tr></tr></tbody></table></td></tr><tr id="options-content"><td></td></tr></tbody></table>`;

        // Element for both the options tabs and the content area
        var optionsElement = htmlToElement(options_html);

        var default_pardus_options_content = document.getElementsByTagName('table')[2];
        var pardus_main_element = default_pardus_options_content.parentNode;

        default_pardus_options_content.setAttribute("id", "options-content-pardus-default");
        default_pardus_options_content.setAttribute("hidden", "");

        optionsElement.childNodes[0].childNodes[1].childNodes[0].appendChild(default_pardus_options_content);

        pardus_main_element.appendChild(optionsElement);
        tabs_element = document.getElementById('options-tabs');
        content_element = document.getElementById('options-content');

        addTab('Pardus Options', 'pardus-default', default_pardus_options_content);
    }

    function addTab(label, id, content) {
        var tmp_content_element = null;

        if (content) {
            tmp_content_element = content;
        } else {
            tmp_content_element = createTabContentElement(label, id);
        }

        var new_tab = {
            active: false,
            label: label,
            id: id.toString(),
            content_element: tmp_content_element,
            tab_element: createTabElement(label, id)
        };

        new_tab.tab_element.addEventListener("click", function(){setAsActive(new_tab.id);}, true);
        tabs_element.childNodes[0].childNodes[0].appendChild(new_tab.tab_element);
        tabs_element.width = (tabs.length + 1) * 96;
        content_element.childNodes[0].appendChild(new_tab.content_element);
        tabs.push(new_tab);

        return new OptionsContent(new_tab.id);
    }

    function setAsActive(id) {
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].id != id) {
                tabs[i].tab_element.setAttribute("style", "background: transparent url('//static.pardus.at/img/std/tab.png') repeat scroll 0% 0%; cursor: default;");
                tabs[i].tab_element.setAttribute("onmouseover", "this.style.background='url(//static.pardus.at/img/std/tabactive.png)';this.style.cursor='default'");
                tabs[i].tab_element.setAttribute("onmouseout", "this.style.background='url(//static.pardus.at/img/std/tab.png)'");
                tabs[i].content_element.setAttribute("hidden", "");
                tabs[i].active = false;
            } else {
                tabs[i].tab_element.setAttribute("style", "background: transparent url('//static.pardus.at/img/std/tabactive.png') repeat scroll 0% 0%; cursor: default;");
                tabs[i].tab_element.setAttribute("onmouseover", "this.style.cursor='default'");
                tabs[i].tab_element.removeAttribute("onmouseout");
                tabs[i].content_element.removeAttribute("hidden");
                tabs[i].active = true;
            }
        }
    }

    function createTabElement(label, id) {
        return htmlToElement(`<td id="` + id.toString() + `" style="background: transparent url(&quot;//static.pardus.at/img/std/tab.png&quot;) repeat scroll 0% 0%; cursor: default;" onmouseover="this.style.background='url(//static.pardus.at/img/std/tabactive.png)';this.style.cursor='default'" onmouseout="this.style.background='url(//static.pardus.at/img/std/tab.png)'" class="tabcontent">` + label + `</td>`);
    }

    function createTabContentElement(label, id) {
        return htmlToElement(`<table hidden class="messagestyle" id="options-content-` + id.toString() + `" style="background:url(//static.pardus.at/img/std/bgdark.gif)"><tbody><tr><td><div align="center"><h1>` + label + `</h1></div><div id="saved-message" align="center" hidden=""><h2><font style="border:2px; border-style:solid; border-radius:10px; border-color:#00AA00; padding: 5px;" color="green">Settings saved</font></h2></div><table width="100%" align="center"><tbody><tr><td id="options-content-` + id.toString() + `-left" width="350" valign="top"></td><td width="40"></td><td id="options-content-` + id.toString() + `-right" width="350" valign="top"></td></tr></tbody></table></td></tr></tbody></table>`);
    }

    function drawTabs() {
        tabs_element.width = tabs.length * 96;
        tabs_element.childNodes[0].childNodes[0].innerHTML = "";
        for (var i = 0; i < tabs.length; i++) {
            tabs_element.childNodes[0].childNodes[0].appendChild(tabs[i].tab_element);
        }
    }

    function export_upgrade() {
        return {
            version: get_version(),
            tabs: tabs,
            tabs_element: tabs_element,
            content_element: content_element
        };
    }

    function import_upgrade(import_vals = {tabs: [], tabs_element: null, content_element: null}) {
        tabs = import_vals.tabs;
        tabs_element = import_vals.tabs_element;
        content_element = import_vals.content_element;
    }

    return {
        version: function() {
            return get_version();
        },
        addNewTab: function(label, id) {
            return addTab(label, id, null);
        },
        getTab: function(id) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].id == id) {
                    return tabs[i];
                }
            }
        },
        create: function() {
            initialise();
            setAsActive('pardus-default');
        },
        export_upgrade: function() {
            return export_upgrade();
        },
        import_upgrade: function(import_vals) {
            import_upgrade(import_vals);
        }
    };

})();

function OptionsContent(id) {
    this.id = id;
    this.left_boxes = [];
    this.right_boxes = [];
    this.left_element = document.getElementById('options-content-' + id.toString() + '-left');
    this.right_element = document.getElementById('options-content-' + id.toString() + '-right');
    this.addBox = function(heading, premium = false) {
        var new_box = null;
        if (this.left_boxes.length <= this.right_boxes.length) {
            new_box = this.addBoxLeft(heading, premium);
        } else {
            new_box = this.addBoxRight(heading, premium);
        }
        return new_box;
    };
    this.addBoxLeft = function(heading, premium = false) {
        var new_box = new OptionsBox(id + '-left', this.left_boxes.length, heading, premium);
        this.left_element.appendChild(new_box.element);
        this.left_element.appendChild(document.createElement('br'));
        this.left_element.appendChild(document.createElement('br'));
        this.left_boxes.push(new_box);
        new_box.initialise();
        return new_box;
    };
    this.addBoxRight = function(heading, premium = false) {
        var new_box = new OptionsBox(id + '-right', this.right_boxes.length, heading, premium);
        this.right_element.appendChild(new_box.element);
        this.right_element.appendChild(document.createElement('br'));
        this.right_element.appendChild(document.createElement('br'));
        this.right_boxes.push(new_box);
        new_box.initialise();
        return new_box;
    };
    this.addPremiumBox = function(heading) {
        return this.addBox(heading, true);
    };
    this.addPremiumBoxLeft = function(heading) {
        return this.addBoxLeft(heading, true);
    };
    this.addPremiumBoxRight = function(heading) {
        return this.addBoxRight(heading, true);
    };
}

function OptionsBox(id, number, heading, premium = false) {
    var header_html = '<th>';
    if (premium == true) {
        header_html = '<th class="premium">';
    }
    this.id = 'options-content-' + id.toString() + '-box-' + number.toString();
    this.front_container = `<form id="` + this.id + `" action="none"><table style="background:url(//static.pardus.at/img/std/bgd.gif)" width="100%" cellpadding="3" align="center"><tbody><tr>` + header_html + heading + `</th></tr>`;
    this.back_container = `</tbody></table></form>`;
    this.inner_html = ``;
    this.description = new DescriptionElement(this.id + '-description');
    this.options_group = new OptionsGroup(this.id + '-options-group', premium);
    this.element = htmlToElement(this.front_container + this.description + this.inner_html + this.options_group + this.back_container);
    this.refreshElement = function() {
        this.element = htmlToElement(this.front_container + this.description + this.inner_html + this.options_group + this.back_container);
        document.getElementById(this.id).replaceWith(this.element);
        this.options_group.setSaveButtonFunction();
    };
    this.setInnerHTML = function(inner_html_to_set) {
        this.inner_html = inner_html_to_set;
        this.refreshElement();
    };
    this.initialise = function() {
        this.options_group.setSaveButtonFunction();
    }
    this.addBooleanOption = function(variable_to_bind, text_description, default_value = false) {
        var new_option = this.options_group.addBooleanOption(variable_to_bind, text_description, default_value);
        this.refreshElement();
        new_option.initialiseValue();
    }
}

function OptionsGroup(id, premium = false) {
    this.id = id;
    this.options = [];
    this.front_container = {
        styling: 'style="display: none;"',
        id: '',
        setId: function(id) {
            this.id = id
        },
        setStyle: function(style) {
            this.styling = 'style="' + style + '"';
        },
        toString: function() {
            return '<tr id="' + this.id + '" ' + this.styling + '><td><table><tbody>';
        }
    }
    this.front_container.setId(id);
    this.back_container = '</tbody></table></td></tr>';
    this.save_button = '<tr><td align="right"><input value="Save" id="' + this.id + '-save-button" type="button"></td></tr>';
    this.premium = premium;

    if (this.premium) {
        this.save_button = '<tr><td align="right"><input value="Save" id="' + this.id + '-save-button" type="button" style="color:#FFCC11"></td></tr>';
    }

    this.addOption = function() {
        return;
    }
    this.addBooleanOption = function(variable_to_bind, text_description, default_value = false) {
        var new_option = new BooleanOption(this.id + '-option-' + this.options.length, variable_to_bind, text_description, default_value);
        this.options.push(new_option);
        return new_option;
    }
    this.setSaveButtonFunction = function() {
        var _this = this;

        function saveButtonFunction() {
            var i = 0;
            for (i = 0; i < _this.options.length; i++) {
                _this.options[i].saveValue();
            }
            if (_this.premium) {
                displayPremiumSaved(_this.id + '-save-button');
            } else {
                displaySaved(_this.id + '-save-button');
            }
        }

        function displaySaved(id) {
            var save_button = document.getElementById(id);
            save_button.setAttribute('disabled', 'true');
            save_button.value = 'Saved';
            save_button.setAttribute('style', 'color:green;background-color:silver');
            setTimeout(function() {
                save_button.removeAttribute('disabled');
                save_button.value = 'Save';
                save_button.removeAttribute('style');
            }, 2000);
        }

        function displayPremiumSaved(id) {
            var save_button = document.getElementById(id);
            save_button.setAttribute('disabled', 'true');
            save_button.value = 'Saved';
            save_button.setAttribute('style', 'color:green;background-color:silver');
            setTimeout(function() {
                save_button.removeAttribute('disabled');
                save_button.value = 'Save';
                save_button.setAttribute('style', 'color:#FFCC11');
            }, 2000);
        }

        if (document.getElementById(this.id + '-save-button')) {
            if (document.getElementById(this.id + '-save-button').addEventListener) {
                document.getElementById(this.id + '-save-button').addEventListener("click", saveButtonFunction, false);
            } else if (document.getElementById(this.id + '-save-button').attachEvent) {
                document.getElementById(this.id + '-save-button').attachEvent('onclick', saveButtonFunction);
            }
        } else {
            console.log("No element '" + this.id + "-save-button'.");
        }
    }
    this.initialiseValues = function() {
        var i = 0;
        for (i = 0; i < options.length; i++) {
            options[i].initialiseValue();
        }        
    }
    this.toString = function() {

        // If no options have been defined, then don't add any elements
        if (this.options.length == 0) {
            this.front_container.setStyle("display: none;");
        } else {
            this.front_container.setStyle("");
        }

        return this.front_container + this.options.join('') + this.back_container + this.save_button;
    }
}

function BooleanOption(id, variable_to_bind, text_description, default_value = false) {
    this.id = id;
    this.type = 'checkbox';
    this.variable_to_bind = variable_to_bind;
    this.text_description = text_description;
    this.toString = function() {
        return '<tr><td>' + this.text_description + '</td><td><input id="' + this.id + '" type="' + this.type + '"></td></tr>';
    }
    this.initialiseValue = function() {
        document.getElementById(this.id).checked = GM_getValue(get_universe() + "_" + this.variable_to_bind, default_value);
    }
    this.saveValue = function() {
        GM_setValue(get_universe() + "_" + this.variable_to_bind, document.getElementById(this.id).checked);
    }
}

/**
 *  Controls the description for a specific OptionsBox, only one description per OptionsBox permitted
 */
function DescriptionElement(id) {
    this.id = id;
    this.back_container = '</tr></tbody></table></td></tr>'
    this.description = '';
    this.image_left = '';
    this.image_right = '';
    this.alignment = 'center';
    this.front_container = {
        styling: 'style="display: none;"',
        id: '',
        setId: function(id) {
            this.id = id
        },
        setStyle: function(style) {
            this.styling = 'style="' + style + '"';
        },
        toString: function() {
            return '<tr id=' + this.id + ' ' + this.styling + '><td><table><tbody><tr>';
        }
    }
    this.front_container.setId(id);
    this.element = htmlToElement(this.toString());
    this.addImageLeft = function(image_src) {
        this.image_left = '<td><img src="' + image_src + '"></td>';
        this.refreshElement();
    }
    this.addImageRight = function(image_src) {
        this.image_right = '<td><img src="' + image_src + '"></td>';
        this.refreshElement();
    }
    this.setDescription = function(description_to_set) {
        this.description = description_to_set;

        if (this.description == '') {
            this.front_container.setStyle("display: none;");
        } else {
            this.front_container.setStyle("");
        }

        this.refreshElement();
    }
    this.setAlignment = function(alignment) {
        this.alignment = alignment;
        this.refreshElement();
    }

    /**
     *  Converts the DescriptionElement into its html form.
     */
    this.toString = function() {
        return this.front_container + this.image_left + '<td align="' + this.alignment + '">' + this.image_right + this.description + '</td>' + this.back_container;
    }
    this.refreshElement = function() {
        this.element = htmlToElement(this.toString());
        document.getElementById(this.id).replaceWith(this.element);
    };
}

function get_universe() {
    var universe = '';

    switch (document.location.hostname) {
        case "orion.pardus.at":
            universe = "orion";
            break;
        case "artemis.pardus.at":
            universe = "artemis";
            break;
        case "pegasus.pardus.at":
            universe = "pegasus";
            break;
    }

    return universe;
}

/**
 *  Helper functions
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
  *  Add the Options object to the page for all scripts to use
  */
if (document.location.pathname == '/options.php') {
    if(typeof unsafeWindow.Options === 'undefined' || !unsafeWindow.Options) {
        (function(){
            unsafeWindow.Options = Options;
            unsafeWindow.Options.create();
        })();
    } else {

        // Upgrade the version if two scripts use different ones
        if (unsafeWindow.Options) {
            if (unsafeWindow.Options.version() < Options.version()) {
                console.log("Upgrading Pardus Options Library from version " + unsafeWindow.Options.version() + " to " + Options.version() + ".");
                Options.import_upgrade(unsafeWindow.Options.export_upgrade());
                unsafeWindow.Options = Options;
            }
        }
    }
}