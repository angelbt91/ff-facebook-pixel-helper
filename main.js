let fbq2 = fbq;

let eventCatcher = function(value) {
    console.log("Llamada capturada:", value);
};

fbq = function(task, event, params = null) {
    eventCatcher(`${task}, ${event}, ${params}`);

    if (params) {
        fbq2(task, event, params);
    } else {
        fbq2(task, event);
    }
};