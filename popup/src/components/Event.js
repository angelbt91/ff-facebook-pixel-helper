import React from "react";
import "./Event.modules.css";
import {MdInfo} from "react-icons/md";
import {AiFillRightCircle, AiFillRightSquare} from "react-icons/ai";

function Event(props) {
    let event = props.event;
    let eventIcon,
        eventTitle,
        eventParameters;

    const getEventParametersComponents = (event) => {
        let paramComponents = [];
        for (let param in event.param2) {
            paramComponents.push(
                <>
                    <p className="parameterTitle">{param}</p>
                    <p className="parameterValue">{JSON.stringify(event.param2[param])}</p>
                </>
            );
        }
        return paramComponents;
    }

    switch (event.param0) {
        case "init":
            eventIcon = <MdInfo className="eventIcon"/>
            eventTitle = `Pixel ${event.param1} initiated`;
            break;
        case "track":
            eventIcon = <AiFillRightCircle className="eventIcon"/>;
            eventTitle = event.param1;
            if (event.param2) {
                eventParameters = getEventParametersComponents(event);
            }
            break;
        case "trackCustom":
            eventIcon = <AiFillRightSquare className="eventIcon"/>;
            eventTitle = event.param1;
            if (event.param2) {
                eventParameters = getEventParametersComponents(event);
            }
            break;
        default:
            break;
    }

    return (
        <>
            <div className="event">
                <div className="eventUpperBlock">
                    {eventIcon}
                    <p className="eventTitle">{eventTitle}</p>
                </div>
                <div className="eventLowerBlock">
                    {eventParameters && eventParameters.map(event => {
                        return event;
                    })}
                </div>
            </div>
        </>
    )
}

export default Event;