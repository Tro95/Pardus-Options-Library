# Pardus-Options-Library
The Pardus Options Library is a script designed to add useful and easy ways to interact with  the Options page within other scripts related to the online game Pardus (https://pardus.at).

Instructions:
 - At the top of your Tampermonkey script, ensure you have the following lines:
```
// @grant           unsafeWindow
// @require         https://raw.githubusercontent.com/Tro95/Pardus-Options-Library/v1.1/pardus_options_library.js
```
This will allow the unsafeWindow permision within your script, which is necessary to guarantee safe
interactions with other scripts utilising this library also. This will also include the library
itself, embedding it within the unsafeWindow object.

 - Ensure your script is allowed to run on the Options page:
```        
// @include http*://*.pardus.at/options.php
```
 - Within your script, you should ensure you check `document.location.pathname` to see if you're on the `options.php` page, as the library is only defined and available on this page.

```
if (document.location.pathname == '/options.php') {
    // Option-related logic goes here
}
```
 - The library is available through a singleton object `unsafeWindow.Options`.

 - Add a new tab to the Options page. Recommended usage is one tab per script or userspace.

```
unsafeWindow.Options.addNewTab(label, id)
```                    
label:  String to display in the tab. Visual limitations means this can only be a maximum
        of two words, 10 characters each.
id:     HTML element id for the tab. This should be a string with no whitespace, convention
        is to all be lowercase and words separated with hyphens. 

Returns:    OptionsContext object. This should be assigned to a variable that is then used
            to add options boxes into the tab.

 - Get an existing tab on the Options page. This is for scripts that wish to share the same tab.

```
unsafeWindow.Options.getTab(id)
```
id:     HTML element id for the tab you wish to return.

Returns:    OptionsContext object of the existing tab. This should be assigned to a variable
            that is then used to add options boxes into the tab.
