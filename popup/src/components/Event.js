import React, {useState} from "react";
import "./Event.modules.css";
import {AiFillCheckCircle, AiFillCheckSquare, AiOutlineRight, AiOutlineDown} from "react-icons/ai";
import {BsFillLightningFill} from "react-icons/bs"

function Event(props) {
    let event = props.event;
    let eventIcon,
        eventTitle,
        eventParameters;

    const [showParamsBlock, setShowParamsBlock] = useState(false);

    const getEventParametersComponents = (event) => {
        let paramComponents = [];
        for (let param in event.param3) {
            if (event.param3.hasOwnProperty(param)) {
                paramComponents.push(
                    <>
                        <p className="parameterTitle">{param}</p>
                        <p className="parameterValue">{event.param3[param]}</p>
                    </>
                );
            }
        }
        return paramComponents;
    }

    switch (event.param1) {
        case "track":
            eventIcon = <AiFillCheckCircle className="eventIcon green"/>;
            eventTitle = event.param2;
            if (event.param3) {
                eventParameters = getEventParametersComponents(event);
            }
            break;
        case "trackCustom":
            eventIcon = <AiFillCheckSquare className="eventIcon green"/>;
            eventTitle = event.param2;
            if (event.param3) {
                eventParameters = getEventParametersComponents(event);
            }
            break;
        case "microdata":
            eventIcon = <BsFillLightningFill className="eventIcon blue"/>;
            eventTitle = "Microdata Automatically Detected";
            if (event.param3) {
                eventParameters = getEventParametersComponents(event);
            }
            break;
        case "btnclick":
            eventIcon = <BsFillLightningFill className="eventIcon blue"/>;
            eventTitle = "Button Click Automatically Detected";
            if (event.param3) {
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
                    {eventParameters ? (showParamsBlock ?
                            <span onClick={() => setShowParamsBlock(!showParamsBlock)}>
                                <span className="eventTitle clickable">{eventTitle}</span>
                                <span className="showParamsIcon clickable"><AiOutlineDown/></span>
                            </span> :
                            <span onClick={() => setShowParamsBlock(!showParamsBlock)}>
                                <span className="eventTitle clickable">{eventTitle}</span>
                                <span className="showParamsIcon clickable"><AiOutlineRight/></span>
                            </span>
                    ) : <p className="eventTitle">{eventTitle}</p>}
                </div>
                {showParamsBlock &&
                <div className="eventLowerBlock">
                    {eventParameters && eventParameters.map(event => {
                        return event;
                    })}
                </div>
                }
            </div>
        </>
    )
}

export default Event;