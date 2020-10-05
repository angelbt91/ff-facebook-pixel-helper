import React, {useState, useEffect} from 'react';
import './App.css';
import Event from "./components/event";

function App() {
    let [events, setEvents] = useState(["Nothing to show"]);

    useEffect(() => {
        /* eslint-disable no-undef */
        browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {type: "getEvents"}, function (eventsReceived) {
                if (eventsReceived.length > 0) {
                    console.log("Events received:");
                    console.log(eventsReceived);
                    setEvents(eventsReceived);
                }
            });
        });
        /* eslint-disable no-undef */
    }, [])

    return (
        <div>
            <header className="App-header">
                {events.map(event => { return <Event event={event}/> })}
            </header>
        </div>
    );
}

export default App;
