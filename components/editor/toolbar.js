import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAlignCenter,
    faAlignLeft,
    faAlignRight,
    faBold,
    faChevronDown,
    faChevronUp,
    faCode,
    faHighlighter,
    faItalic,
    faListOl,
    faListUl,
    faQuoteRight,
    faStrikethrough,
    faSubscript,
    faSuperscript,
    faTextWidth,
    faUnderline,
    faImage,
} from "@fortawesome/free-solid-svg-icons";
import { RichUtils, EditorState } from "draft-js";

const Toolbar = ({ imagePlugin, editorState, setEditorState }) => {
    const fileInputRef = useRef(null);

    const tools = [
        { label: "bold", style: "BOLD", icon: <FontAwesomeIcon icon={faBold} />, method: "inline" },
        { label: "italic", style: "ITALIC", icon: <FontAwesomeIcon icon={faItalic} />, method: "inline" },
        { label: "underline", style: "UNDERLINE", icon: <FontAwesomeIcon icon={faUnderline} />, method: "inline" },
        { label: "highlight", style: "HIGHLIGHT", icon: <FontAwesomeIcon icon={faHighlighter} />, method: "inline" },
        { label: "strike-through", style: "STRIKETHROUGH", icon: <FontAwesomeIcon icon={faStrikethrough} />, method: "inline" },
        { label: "Superscript", style: "SUPERSCRIPT", icon: <FontAwesomeIcon icon={faSuperscript} />, method: "inline" },
        { label: "Subscript", style: "SUBSCRIPT", icon: <FontAwesomeIcon icon={faSubscript} />, method: "inline" },
        { label: "Monospace", style: "CODE", icon: <FontAwesomeIcon icon={faTextWidth} transform="grow-3" />, method: "inline" },
        { label: "Blockquote", style: "blockquote", icon: <FontAwesomeIcon icon={faQuoteRight} transform="grow-2" />, method: "block" },
        { label: "Unordered-List", style: "unordered-list-item", icon: <FontAwesomeIcon icon={faListUl} transform="grow-6" />, method: "block" },
        { label: "Ordered-List", style: "ordered-list-item", icon: <FontAwesomeIcon icon={faListOl} transform="grow-6" />, method: "block" },
        { label: "Code Block", style: "CODEBLOCK", icon: <FontAwesomeIcon icon={faCode} transform="grow-3" />, method: "inline" },
        { label: "Uppercase", style: "UPPERCASE", icon: <FontAwesomeIcon icon={faChevronUp} transform="grow-3" />, method: "inline" },
        { label: "lowercase", style: "LOWERCASE", icon: <FontAwesomeIcon icon={faChevronDown} transform="grow-3" />, method: "inline" },
        { label: "Left", style: "leftAlign", icon: <FontAwesomeIcon icon={faAlignLeft} transform="grow-2" />, method: "block" },
        { label: "Center", style: "centerAlign", icon: <FontAwesomeIcon icon={faAlignCenter} transform="grow-2" />, method: "block" },
        { label: "Right", style: "rightAlign", icon: <FontAwesomeIcon icon={faAlignRight} transform="grow-2" />, method: "block" },
        { label: "Image", icon: <FontAwesomeIcon icon={faImage} />, method: "image" },
        { label: "H1", style: "header-one", method: "block" },
        { label: "H2", style: "header-two", method: "block" },
        { label: "H3", style: "header-three", method: "block" },
        { label: "H4", style: "header-four", method: "block" },
        { label: "H5", style: "header-five", method: "block" },
        { label: "H6", style: "header-six", method: "block" },
    ];

    const applyStyle = (e, style, method) => {
        e.preventDefault();
        if (method === "block") {
            setEditorState(RichUtils.toggleBlockType(editorState, style));
        } else if (method === "inline") {
            setEditorState(RichUtils.toggleInlineStyle(editorState, style));
        } else if (method === "image") {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const contentState = editorState.getCurrentContent(); // Get current content
                const newEditorState = imagePlugin.addImage(
                    EditorState.push(editorState, contentState, 'insert-fragment'), // Preserve content
                    reader.result
                );
                setEditorState(newEditorState);
            };
            reader.readAsDataURL(file);
        }
    };

    const isActive = (style, method) => {
        if (method === "block") {
            const selection = editorState.getSelection();
            const blockType = editorState
                .getCurrentContent()
                .getBlockForKey(selection.getStartKey())
                .getType();
            return blockType === style;
        } else if (method === "inline") {
            const currentStyle = editorState.getCurrentInlineStyle();
            return currentStyle.has(style);
        }
        return false;
    };

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 ">
            {tools.map((item, idx) => (
                <button
                    key={`${item.label}-${idx}`}
                    title={item.label}
                    onClick={(e) => applyStyle(e, item.style, item.method)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`${
                        isActive(item.style, item.method)
                            ? "text-white"
                            : "text-gray-400"
                    } p-2 transition-colors duration-200 hover:text-white focus:outline-none`}
                >
                    {item.icon || item.label}
                </button>
            ))}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default Toolbar;