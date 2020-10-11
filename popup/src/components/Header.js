import React from "react";
import "./Header.modules.css";
import {AiOutlineQuestionCircle} from "react-icons/ai";

function Header() {
    return (
        <div className="header">
            <div className="headerLogoAndTitle">
                <div className="headerLogo">.</div>
                <p className="headerTitle">Firefox Facebook Pixel Helper</p>
            </div>
            <a href="https://github.com/angelbt91/ff-pixel-helper" target="_blank" className="moreInfoIcon">
                <AiOutlineQuestionCircle/>
            </a>
        </div>
    )
}

export default Header;