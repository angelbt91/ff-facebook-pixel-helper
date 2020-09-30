browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, {type: "getEvents"}, function (eventsReceived) {
        paintReport(eventsReceived);
    });
});

const paintReport = function (events) {
    const rootNode = document.getElementById("root");

    events.forEach(function (event) {
        const block = document.createElement("div");
        const action = event.param0.toLowerCase();
        let text = document.createElement("p");

        if (action === "init") {
            text.textContent = `PIXEL INITIATED: ${event.param1}`;
        } else if (action === "track") {
            text.textContent = `EVENT FIRED: ${event.param1}.`;
        } else if (action === "trackcustom") {
            text.textContent = `CUSTOM EVENT FIRED: ${event.param1}.`
        } else if (action === "set") {
            text.textContent = `AGENT SET: ${event.param1}, ${event.param2}, ${event.param3}`
        }

        block.appendChild(text);
        rootNode.appendChild(block);
    });
}