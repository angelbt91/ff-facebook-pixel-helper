// sends a message on page load, so background script know it has to flush the events for that tab
browser.runtime.sendMessage({type: "tabReloaded"});