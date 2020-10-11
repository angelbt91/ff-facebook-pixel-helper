import React from "react";
import "./Event.modules.css";
import {MdInfo} from "react-icons/md";
import {AiFillRightCircle, AiFillRightSquare} from "react-icons/ai";

function Event(props) {
    let event = props.event;

    let printEvent = true;
    let eventIcon;
    let eventTitle;
    let eventParameters;

    const isValidPixelID = (value) => {
        return value.match(/^[0-9]+$/) !== null;
    }

    const isStandardConversion = (conversionName) => {
        const standardConversions = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
            "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "PageView",
            "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"]
        return standardConversions.includes(conversionName);
    }

    const getEventParametersComponents = (event) => {
        let paramComponents = [];
        for (let param in event.param2) {
            paramComponents.push(
                <div className="parameter">
                    <p className="parameterTitle">{param}</p>
                    <p className="parameterValue">{JSON.stringify(event.param2[param])}</p>
                </div>
            );
        }
        return paramComponents;
    }

    switch (event.param0) {
        case "init":
            if (isValidPixelID(event.param1)) {
                eventIcon = <MdInfo className="eventIcon"/>
                eventTitle = `Pixel ${event.param1} initiated`;
            }
            break;
        case "track":
            if (isStandardConversion(event.param1)) {
                eventIcon = <AiFillRightCircle className="eventIcon"/>;
                eventTitle = event.param1;
            }
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
            printEvent = false;
            break;
    }

    if (!printEvent) {
        return null;
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