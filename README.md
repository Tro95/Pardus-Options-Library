# Pardus-Options-Library
The Pardus Options Library is a script designed to add useful and easy ways to interact with the Options page within other scripts related to the online game Pardus (https://pardus.at). It is written entirely in ECMAScript 6.

## Installation
At the top of your Tampermonkey script, ensure you have the following lines:
```javascript
// @include     http*://*.pardus.at/options.php
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       unsafeWindow
// @require     https://raw.githubusercontent.com/Tro95/Pardus-Options-Library/v1.4/pardus_options_library.js
```
The `GM_setValue` and `GM_getValue` methods are required to persistently store the user's settings. The `unsafeWindow` object is required to allow multiple scripts to use this library concurrently. It is the only supported way to interact with the library.

### Multiple Scripts

This library is safe to be included by multiple scripts. Tampermonkey runs each of the user's script in turn, and each script using this library will attempt to load it in and embed it onto the page in the `unsafeWindow` object. If the library has already been embedded by a prior script, loading in the library for a second time will perform a version check, and the greater version will be kept. In swapping an older version for a greater version, all internal objects will be copied over.

## Usage

Within your script you should check `document.location.pathname` to see if you're on the `options.php` page, as the library is only defined and available on this page.
```javascript
if (document.location.pathname === '/options.php') {
    // Option-related logic goes here
}
```
The library is available through a singleton object `unsafeWindow.PardusOptions`. It is recommended to abstract your options logic into a separate function.

```javascript
function myOptionsLogic() {
    /**
     *  Create the tab for your script
     */
    const myScriptsTab = unsafeWindow.PardusOptions.addTab({
        heading: 'My Script',
        id: 'my-script',
        saveFunction: GM_setValue,
        getFunction: GM_getValue
    });

    /**
     *  Create a box for your options
     */
    const mainOptionsBox = myScriptsTab.addBox({
        heading: 'Main Options',
        description: 'These are the main options for my script'
    });

    /**
     *  Create a boolean option, and bind it to the universe-specific variable.
     */
    const mainOptionsBox.addBooleanOption({
        variable: 'enable_super_cool_feature',
        description: 'Enable the super cool feature',
        defaultValue: true
    });
}

if (document.location.pathname === '/options.php') {
    // Call the options logic
    myOptionsLogic();
}
```

### Saving Variables And Scoping

One of the early design decisions was whether to make the library a shared singleton object between all scripts, or let each script have their own version. Due to performance and complexity constraints the shared singleton approach was chosen, however this has caused some problems with Tampermonkey scoping.

From Tampermonkey's point of view, this library will exist only within the scope of one script at any point in time, and this script will be the one to have embedded its instance of the library object `unsafeWindow.PardusOptions`. Any other script attempting to access the `unsafeWindow.PardusOptions` object will cause any Tampermonkey-related methods to execute in the scope of the initial script. This is particularly problematic for the `GM_getValue` and `GM_setValue` methods, as all values being saved in all scripts using this library (when on the options page) will be saved in the scope of a single script, and irretrievable outside the library.

To solve this problem the library has abstracted away the `GM_getValue` and `GM_setValue` methods, and instead allows you to pass in the `GM_getValue` and `GM_setValue` methods from your script that are correctly scoped at runtime to all library object constructors. These methods are passed down to all smaller objects in turn, so it is recommended to set them on the `unsafeWindow.PardusOptions.addTab()` call, as opposd to any further down. If you plan to share the same tab with multiple scripts, then you will have to pass the `GM_getValue` and `GM_setValue` methods in at the `OptionsContent.addBox()` call instead.

If you ever encounter log lines saying `Default save function not overridden, script cannot save key '${key}' with value '${value}'` or `Default get function not overridden, script cannot get key '${key}' with default value ${defaultValue}'`, it means somepart of the library has not received the correctly-scoped `GM_getValue` and `GM_setValue` methods and that you should pass them in.

## Reference

### PardusOptions Object
`unsafeWindow.PardusOptions`
#### Creation
This is a singleton object that you should not construct, and as such the constructor is not documented here. Including the library in your script will automatically create it on the relevant options page.
#### Methods

##### version
Static method, returning the version of the library.
```javascript
unsafeWindow.PardusOptions.constructor.version();
```
##### addTab
Creates a new tab and returns an object allowing manipulation of the content of the tab. Recommended usage is one tab per script.
```javascript
unsafeWindow.PardusOptions.addTab({
    id,
    heading,
    saveFunction,
    getFunction
});
```
**id** [*Required*]: An identification string with no spaces that must be unique across all scripts using this library.  
**heading** [*Required*]: The heading of the tab. You should ensure this string is not too long to break the formatting.  
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. It is highly recommended to put a value of `GM_setValue` here.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. It is highly recommended to put a value of `GM_getValue` here.  

Returns an object of type OptionsContent, allowing manipulation of the content within the tab's content area.

Example:
```javascript
const myTab = unsafeWindow.PardusOptions.addTab({
    id: 'my-scripts-tab',
    heading: 'My Script',
    saveFunction: GM_setValue,
    getFunction: GM_getValue
});
```


### Class OptionsContent
Represents all the content within a single tab, allowing for easy creation of OptionsBoxes.
#### Creation
You should use the `unsafeWindow.PardusOptions.addTab()` method to obtain an OptionsContent object, and as such the constructor is not documented here.
#### Methods

##### addBox
Creates a new box in the contents area of the tab, and returns an object allowing manipulation of the content of the box. Recommended usage is one box per group of related options. This box will be placed on either the left or right side of the screen depending on the length of all the other boxes. If you wish to control the placing, see `addBoxLeft` and `addBoxRight`.
```javascript
addBox({
    heading,
    description = '',
    premium = false,
    saveFunction = this.saveFunction,
    getFunction = this.getFunction,
}
```
**heading** [*Required*]: The heading of the box.  
**description** [*Optional*]: The description text for the box, to be displayed under the heading.  
**premium** [*Optional*]: A boolean value on whether to style the box with the premium styling or not. Useful for separating options relating to features exclusive for premium members.   
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. Will inherit the save function of the tab.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. Will inherit the get function of the tab.  

Returns an object of type OptionsBox, allowing creation of options within the box.

Example:
```javascript
const myBox = myTab.addBox({
    heading: 'Main Options',
    description: 'These are the main options for my script.'
});
```

##### addBoxLeft
Creates a new box in the left column of the contents area of the tab, and returns an object allowing manipulation of the content of the box. Recommended usage is one box per group of related options. This box will be placed on the left side of the screen..
```javascript
addBoxLeft({
    heading,
    description = '',
    premium = false,
    saveFunction = this.saveFunction,
    getFunction = this.getFunction,
}
```
**heading** [*Required*]: The heading of the box.  
**description** [*Optional*]: The description text for the box, to be displayed under the heading.  
**premium** [*Optional*]: A boolean value on whether to style the box with the premium styling or not. Useful for separating options relating to features exclusive for premium members.  
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. Will inherit the save function of the tab.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. Will inherit the get function of the tab.  

Returns an object of type OptionsBox, allowing creation of options within the box.

Example:
```javascript
const myBox = myTab.addBoxLeft({
    heading: 'Main Options',
    description: 'These are the main options for my script.'
});
```

##### addBoxRight
Creates a new box in the right column of the contents area of the tab, and returns an object allowing manipulation of the content of the box. Recommended usage is one box per group of related options. This box will be placed on the right side of the screen..
```javascript
addBoxLeft({
    heading,
    description = '',
    premium = false,
    saveFunction = this.saveFunction,
    getFunction = this.getFunction,
}
```
**heading** [*Required*]: The heading of the box.  
**description** [*Optional*]: The description text for the box, to be displayed under the heading.  
**premium** [*Optional*]: A boolean value on whether to style the box with the premium styling or not. Useful for separating options relating to features exclusive for premium members.  
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. Will inherit the save function of the tab.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. Will inherit the get function of the tab.  

Returns an object of type OptionsBox, allowing creation of options within the box.

Example:
```javascript
const myBox = myTab.addBoxLeft({
    heading: 'Main Options',
    description: 'These are the main options for my script.'
});
```




### Class OptionsBox
Represents a box that contains options.
#### Creation
You should use the `OptionsContent.addBox()` method to obtain an OptionsBox object, and as such the constructor is not documented here.
#### Methods

##### addBooleanOption
Creates a checkbox within the options box, and binds its value to a variable that can be saved persistently using the `saveFunction`.
```javascript
addBooleanOption({
    variable,
    description,
    defaultValue = false,
    customSaveFunction = this.saveFunction,
    customGetFunction = this.getFunction,
}
```
**variable** [*Required*]: The variable to bind the boolean value to. This will be translated into `${universe}-${variable}` when passed into the save function, to ensure uniqueness across all the universes.  
**description** [*Required*]: A small amount of text describing what the option is for.  
**defaultValue** [*Optional*]: The default value to set. It is recommended to always define a default value.  
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. Will inherit the save function of the OptionsContent.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. Will inherit the get function of the OptionsContent.  

Returns an object of type BooleanOption, although this isn't used for anything.

Example:
```javascript
myBox.addBooleanOption({
    variable: 'enable_super_cool_feature',
    description: 'Enable the super cool feature',
    defaultValue: true
});
```


##### addNumericOption
Creates a numeric field within the options box, and binds its value to a variable that can be saved persistently using the `saveFunction`.
```javascript
addNumericOption({
    variable,
    description,
    defaultValue = 0,
    min = 0,
    max = 0,
    step = 1,
    saveFunction = this.saveFunction,
    getFunction = this.getFunction,
}
```
**variable** [*Required*]: The variable to bind the boolean value to. This will be translated into `${universe}-${variable}` when passed into the save function, to ensure uniqueness across all the universes.  
**description** [*Required*]: A small amount of text describing what the option is for.  
**defaultValue** [*Optional*]: The default value to set. It is recommended to always define a default value.  
**min** [*Optional*]: The minimum value the field may have.  
**max** [*Optional*]: The maximum value the field may have.  
**step** [*Optional*]: The increments between values.  
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. Will inherit the save function of the OptionsContent.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. Will inherit the get function of the OptionsContent.  

Returns an object of type NumericOption, although this isn't used for anything.

Example:
```javascript
myBox.addNumericOption({
    variable: 'amount_of_power',
    description: 'Amount of power to use',
    defaultValue: 50,
    min: 1,
    max: 100
});
```


##### addSelectOption
Creates a dropdown selection field within the options box, and binds its value to a variable that can be saved persistently using the `saveFunction`.
```javascript
addSelectOption({
    variable,
    description,
    options = [],
    defaultValue = null,
    saveFunction = this.saveFunction,
    getFunction = this.getFunction,
}
```
**variable** [*Required*]: The variable to bind the boolean value to. This will be translated into `${universe}-${variable}` when passed into the save function, to ensure uniqueness across all the universes.  
**description** [*Required*]: A small amount of text describing what the option is for.  
**options** [*Optional*]: An array of dropdown options to give. The array must be in the format `[{value: 'value-to-save', text: 'value to display to the user'}, ...]`. Additionally, one element may contain a `default: true` field instead of passing in a default value.
**defaultValue** [*Optional*]: The default value to set. It is recommended to always define a default value. This should correspond to one of the `value` fields in the `options` parameter.  
**saveFunction** [*Optional*]: A reference to a function that can save a persistent value for you. Will inherit the save function of the OptionsContent.  
**getFunction** [*Optional*]: A reference to a function that can retrieve a persistent value for you. Will inherit the get function of the OptionsContent.  

Returns an object of type NumericOption, although this isn't used for anything.

Example:
```javascript
myBox.addNumericOption({
    variable: 'attack_style',
    description: 'Attack style to use',
    options: [
        {
            value: 'offensive',
            text: 'Offensive'
        },
        {
            value: 'balanced',
            text: 'Balanced',
            default: true
        },
        {
            value: 'defensive',
            text: 'Defensive'
        },
    ]
});
```

