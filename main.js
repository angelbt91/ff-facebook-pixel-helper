window.onload = function () {
    document.body.style.border = "5px solid red"; // helper to debug if ext is running

    let originalFbq = window.wrappedJSObject.fbq;

    let newFbq = (...params) => {
        eventCatcher(...params);
        originalFbq(...params)
    }

    // replace former fbq object in the page by our newFbq
    window.wrappedJSObject.fbq = cloneInto(
        newFbq,
        window,
        {cloneFunctions: true});

    XPCNativeWrapper(window.wrappedJSObject.fbq); // we wrap the original object again

    // TODO catch events fired before plugin load
}

let eventCatcher = function (...params) {
    argumentsLogger(arguments);

    // TODO send to popup
};

let argumentsLogger = function (args) {
    console.log("Call to fbq captured. Arguments:");
    for (let i = 0; i < args.length; i++) {
        console.log(args[i]);
    }
}

