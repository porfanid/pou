import React, { useEffect, useRef, useState } from "react";
import { EditorState, RichUtils, convertToRaw, convertFromRaw } from "draft-js";
import Toolbar from "./toolbar";
import createImagePlugin from "@draft-js-plugins/image";
import Editor from "@draft-js-plugins/editor";
import "@draft-js-plugins/image/lib/plugin.css";
import  {stateToHTML} from 'draft-js-export-html';

// Initialize the image plugin
const imagePlugin = createImagePlugin();
const plugins = [imagePlugin];

const DraftEditor = ({editorState, setEditorState}) => {

    const editor = useRef(null);

    useEffect(() => {
        focusEditor();
    }, []);

    const focusEditor = () => {
        editor.current.focus();
    };

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return true;
        }
        return false;
    };

    // Insert image using the image plugin
    const insertImage = (imageURL) => {
        setEditorState(imagePlugin.addImage(editorState, imageURL));
    };

    // Handle image upload
    const onImageUpload = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    insertImage(reader.result); // Insert image into editor
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    };

    // Custom inline styles
    const styleMap = {
        CODE: {
            className: "bg-gray-100 dark:bg-gray-800 font-mono text-sm p-2",
            style: {
                backgroundColor: "var(--tw-bg-opacity, rgba(0, 0, 0, 0.05))",
                fontFamily: "theme(fontFamily.mono)",
                fontSize: "theme(fontSize.sm)",
                padding: "theme(spacing.2)",
            },
        },
        HIGHLIGHT: {
            className: "bg-pink-900",
            style: { backgroundColor: "#900000" },
        },
        UPPERCASE: {
            className: "uppercase",
            style: { textTransform: "uppercase" },
        },
        LOWERCASE: {
            className: "lowercase",
            style: { textTransform: "lowercase" },
        },
        CODEBLOCK: {
            className: "bg-red-100 dark:bg-red-800 font-mono italic leading-relaxed p-3 px-4 rounded-md",
            style: {
                fontFamily: "theme(fontFamily.mono)",
                fontSize: "inherit",
                background: "theme(colors.red.100)",
                fontStyle: "italic",
                lineHeight: "theme(lineHeight.relaxed)",
                padding: "theme(spacing.3) theme(spacing.4)",
                borderRadius: "theme(borderRadius.md)",
            },
        },
        SUPERSCRIPT: {
            className: "align-super text-xs",
            style: { verticalAlign: "super", fontSize: "theme(fontSize.xs)" },
        },
        SUBSCRIPT: {
            className: "align-sub text-xs",
            style: { verticalAlign: "sub", fontSize: "theme(fontSize.xs)" },
        },
        TITLE: {
            className: "text-title",
            style: { color: "theme(colors.text.title)" },
        },
        MUTED: {
            className: "text-text-muted",
            style: { color: "theme(colors.text.muted)" },
        },
        BODY: {
            className: "font-body",
            style: { fontFamily: "theme(fontFamily.body)" },
        },
        CARD: {
            className: "bg-card rounded-md p-4 shadow-md",
            style: { backgroundColor: "theme(colors.card)", borderRadius: "theme(borderRadius.md)", padding: "theme(spacing.4)" },
        },
    };

    // Custom block styles
    const myBlockStyleFn = (contentBlock) => {
        const type = contentBlock.getType();
        switch (type) {
            case "blockQuote":
                return "text-xl text-white italic pl-4 border-l-4 border-red-600";
            case "leftAlign":
                return "text-left";
            case "rightAlign":
                return "text-right";
            case "centerAlign":
                return "text-center";
            case "justifyAlign":
                return "text-justify";
            case "bold":
                return "font-bold";
            default:
                return null;
        }
    };

    return (
        <div className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" onClick={focusEditor}>
            <Toolbar imagePlugin={imagePlugin} editorState={editorState} setEditorState={setEditorState} onImageUpload={onImageUpload} />
            <div className="editor-container bg-gray-900 p-4 rounded-lg border-2 border-gray-800">
                <Editor
                    ref={editor}
                    placeholder="Write Here"
                    handleKeyCommand={handleKeyCommand}
                    editorState={editorState}
                    customStyleMap={styleMap}
                    blockStyleFn={myBlockStyleFn}
                    onChange={(editorState) => {
                        const contentState = editorState.getCurrentContent();
                        console.log("contentSTate: ",convertToRaw(contentState));
                        console.log(stateToHTML(contentState));
                        setEditorState(editorState);
                    }}
                    plugins={plugins} // Apply the image plugin
                />
            </div>
        </div>
    );
};

export default DraftEditor;
