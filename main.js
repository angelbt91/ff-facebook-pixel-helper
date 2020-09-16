window.onload = function () {
    document.body.style.border = "5px solid red"; // helper to debug if ext is running

    let originalFbq = window.wrappedJSObject.fbq;

    newFbq = function (task, event, params = undefined) {
        eventCatcher(`${task}, ${event}, ${params}`);

        if (params) {
            originalFbq(task, event, params);
        } else {
            originalFbq(task, event);
        }
    };

    // replace former fbq object in the page by our newFbq
    window.wrappedJSObject.fbq = cloneInto(
        newFbq,
        window,
        {cloneFunctions: true});

    // TODO catch events fired before plugin load

    let eventCatcher = function (value) {
        // TODO send to popup
        console.log("Call to fbq captured:", value);
    };
}

