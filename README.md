# FF Facebook Pixel Helper

Unofficial Facebook Pixel Helper extension for Firefox. View all Facebook events fired on the current page.

## Introduction

This Firefox extension emulates the [original Facebook Pixel Helper extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) made by Facebook, which is only available in Chrome.

This extension is not endorsed nor recommended by Facebook. If you encounter any bug or have any suggestion, feel free to report it on the [Issues page](https://github.com/angelbt91/ff-facebook-pixel-helper/issues). 

## Usage

Install this extension from the [Firefox's Add-on Library](https://addons.mozilla.org/en-US/firefox/addon/ff-facebook-pixel-helper/).

## Deployment

Follow these steps if you want to deploy a local copy of the extension from its Github repository.

Clone this repository and get into the folder:
```
$ git clone https://github.com/angelbt91/ff-facebook-pixel-helper.git
$ cd ff-facebook-pixel-helper
```


Install dependencies:

`$ npm install`

Install the Browserify util globally, in order to generate the background script:
```
$ npm install -g browserify
$ browserify background-pre.js -o ff-facebook-pixel-helper-background.js
```

Get into the popup folder, install dependencies and generate the static files for the popup:
``` 
$ cd popup
$ npm install
$ npm run build
```

Create a `build` folder at the root of the project and copy there only the files needed for the plugin to work:
```
$ cd ..
$ mkdir dist dist/popup
$ cp -R icons ff-facebook-pixel-helper-background.js manifest.json ./dist
$ cp -R popup/build ./dist/popup
```

This local copy of the extension generated on the `/dist` folder can be tested by loading it on Firefox as a [temporary addon](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).