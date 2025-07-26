import React from "react";
import styled from "styled-components";
import colors from "@constants/Colors";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill").then((mod) => {
    const Quill = mod.default.Quill;
    var color = Quill.import("attributors/style/color");
    var background = Quill.import("attributors/style/background");
    color.whitelist = [];
    background.whitelist = [];
    Quill.register(color);
    Quill.register(background);
    return mod;
}),{ssr: false});
const Wrap = styled .div`
    & .ql-toolbar{
        background:${colors.SECONDARY};border-radius:8px 8px 0 0;
        & button{
            & .ql-stroke{stroke:${colors.WHITE};}
            & .ql-fill{fill:${colors.WHITE};}
            &:hover,
            &:focus,
            &.ql-active{
                & .ql-stroke{stroke:${colors.RED};}
                & .ql-fill{fill:${colors.RED};}
            }
        }
    }
    & .ql-editor{color:${colors.WHITE};min-height:${props => props.height || "150px"};max-height:400px;overflow:auto;}
    & .ql-container{border-radius:0 0 8px 8px;}
`;
const TextEditor = ({placeholder = "",value = "",height = "150px",handleChange}) => {
    const modules = {
        toolbar: [
            ["bold","italic","underline","strike"],
            ["blockquote","code-block"],
            ["link"],
            ["align",{align: "center"},{align: "right"},{align: "justify"}],
            [{list: "ordered"},{list: "bullet"}],
            [{header: [1,2,3,4,5,6,false]}]
        ],
        clipboard: {matchVisual: false}
    }
    const handleOnChange = (content,delta,source,editor) => {
        let editorHtml = editor.getHTML();
        // editorHtml = editorHtml.replace(/<img[^>]*>/gi,"");
        handleChange(editorHtml);
    }
    return (
        <Wrap height={height}>
            <ReactQuill theme="snow" onChange={handleOnChange} value={value} modules={modules} bounds={".app"} placeholder={placeholder}/>
        </Wrap>
    );
}
export default TextEditor;