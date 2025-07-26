import React from "react";
import styled from "styled-components";
import colors from "@constants/Colors";
const Wrapper = styled.div`
    & .switch-button-control{
        display:flex;flex-direction:row;align-items:center;margin-top:4px;
        & .switch-button{
            background-color:${colors.TEXT};height:1.6em;width:calc(1.6em * 2);border:2px solid ${colors.TEXT};border-radius:1.6em;transition:all 0.3s ease-in-out;cursor:pointer;flex-shrink:0;
            &.enabled{background-color:${colors.GREEN};box-shadow:none;border-color:${colors.GREEN};}
            & .button{height:calc(1.6em - (2 * 2px));width:calc(1.6em - (2 * 2px));border:2px solid ${colors.TEXT};border-radius:calc(1.6em - (2 * 2px));background:${colors.WHITE};transition:all 0.3s ease-in-out;}
            &.enabled{
                & .button{background:${colors.WHITE};transform:translateX(calc(calc(1.6em - (2 * 2px)) + (2 * 2px)));border:2px solid ${colors.GREEN};}
            }
        }
        & .switch-button-label{margin-left:10px;font-size:14px;color:${colors.TEXT};font-weight:500;}
    }
`;
const SwitchButton = ({isEnabled,toggleButton,labelText = "",activeText="Active",inactiveText="Inactive",tooltip = false}) => {
    return (
        <Wrapper>
            <div className="switch-button-control">
                <div className={isEnabled ? "switch-button enabled" : "switch-button"} onClick={toggleButton}>
                    <div className="button" data-rt-tooltip={(tooltip ? (isEnabled ? activeText : inactiveText) : null)}></div>
                </div>
                <div className="switch-button-label">{labelText}</div>
            </div>
        </Wrapper>
    );
}
export default SwitchButton;