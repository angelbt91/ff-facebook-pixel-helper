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

    let eventCatcher = function (value) {
        console.log("Llamada capturada:", value);
    };
}
