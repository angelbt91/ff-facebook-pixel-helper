# FF Pixel Helper

Unofficial Facebook Pixel Helper extension for Firefox. View all Facebook events fired on the current page.

## Introduction

This Firefox extension emulates the [original Facebook Pixel Helper extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) made by Facebook, which is only available in Chrome.

Please note that this extension is fairly experimental and can't guarantee the same accuracy level as the original one. In any case, if you encounter any bug or have any suggestion, feel free to report it on the [Issues tab](https://github.com/angelbt91/ff-pixel-helper/issues). 

This extension is not endorsed nor recommended by Facebook.

## Deployment

Follow these steps if you want to deploy a local copy of the extension from its Github repository.

Clone this repository and get into the folder:
```
$ git clone https://github.com/angelbt91/ff-pixel-helper.git
$ cd ff-pixel-helper
```


Install dependencies:

`$ npm install`

Install the Browserify util globally, in order to generate the background script:
```
$ npm install -g browserify
$ browserify background-pre.js -o background.js
```

Get into the popup folder, install dependencies and generate the static files:
``` 
$ cd popup
$ npm install
$ npm run build
```

This local copy of the extension can be tested by loading it on Firefox as a [temporary addon](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).