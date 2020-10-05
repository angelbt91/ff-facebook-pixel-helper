import React from "react";

function Event(props) {
    let event = props.event;

    return <p>{JSON.stringify(event)}</p>
}

export default Event;