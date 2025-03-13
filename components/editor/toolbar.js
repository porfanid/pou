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
    faLink,
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
import { RichUtils, EditorState, Modifier } from "draft-js";

const Toolbar = ({ imagePlugin, editorState, setEditorState, onImageUpload, applyTextTransform }) => {
    const fileInputRef = useRef(null);

    const tools = [
        { label: "bold", style: "BOLD", icon: <FontAwesomeIcon icon={faBold}/>, method: "inline" },
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
        { label: "Code Block", style: "code-block", icon: <FontAwesomeIcon icon={faCode} transform="grow-3" />, method: "block" },
        { label: "Uppercase", style: "UPPERCASE", icon: <FontAwesomeIcon icon={faChevronUp} transform="grow-3" />, method: "transform" },
        { label: "lowercase", style: "LOWERCASE", icon: <FontAwesomeIcon icon={faChevronDown} transform="grow-3" />, method: "transform" },
        { label: "Left", style: "leftAlign", icon: <FontAwesomeIcon icon={faAlignLeft} transform="grow-2" />, method: "block" },
        { label: "Center", style: "centerAlign", icon: <FontAwesomeIcon icon={faAlignCenter} transform="grow-2" />, method: "block" },
        { label: "Right", style: "rightAlign", icon: <FontAwesomeIcon icon={faAlignRight} transform="grow-2" />, method: "block" },
        { label: "Image", icon: <FontAwesomeIcon icon={faImage} />, method: "image" },
        { label: "Link", icon: <FontAwesomeIcon icon={faLink} />, method: "link" },
    ];

    const headerTools = [
        { label: "H1", style: "header-one", method: "block", className: "font-heading text-lg" },
        { label: "H2", style: "header-two", method: "block", className: "text-base font-bold" },
        { label: "H3", style: "header-three", method: "block", className: "text-sm font-bold" },
        { label: "H4", style: "header-four", method: "block", className: "text-xs font-bold" },
        { label: "H5", style: "header-five", method: "block", className: "text-xs" },
        { label: "H6", style: "header-six", method: "block", className: "text-xs" },
    ];

    const applyStyle = (e, style, method) => {
        e.preventDefault();
        if (method === "block") {
            setEditorState(RichUtils.toggleBlockType(editorState, style));
        } else if (method === "inline") {
            setEditorState(RichUtils.toggleInlineStyle(editorState, style));
        } else if (method === "image") {
            fileInputRef.current.click();
        } else if (method === "transform") {
            applyTextTransform(style);
        } else if (method === "link") {
            const selection = editorState.getSelection();
            const selectedText = getSelectedText(editorState);

            if (selectedText) {
                // If we already have a link, remove it
                if (hasLinkEntity(editorState)) {
                    setEditorState(RichUtils.toggleLink(editorState, selection, null));
                    return;
                }

                const url = prompt("Enter the URL", "https://");
                if (url) {
                    const contentState = editorState.getCurrentContent();
                    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url });
                    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
                    setEditorState(RichUtils.toggleLink(newEditorState, selection, entityKey));
                }
            } else {
                alert("Please select some text first to create a link");
            }
        }
    };

    // Helper to get selected text
    const getSelectedText = (editorState) => {
        const selection = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const startKey = selection.getStartKey();
        const endKey = selection.getEndKey();
        const startOffset = selection.getStartOffset();
        const endOffset = selection.getEndOffset();

        if (startKey === endKey) {
            return currentContent.getBlockForKey(startKey).getText().slice(startOffset, endOffset);
        }

        // Handle multi-block selection if needed
        return "";
    };

    // Check if the current selection has a link entity
    const hasLinkEntity = (editorState) => {
        const selection = editorState.getSelection();
        if (selection.isCollapsed()) {
            return false;
        }

        const contentState = editorState.getCurrentContent();
        const startKey = selection.getStartKey();
        const startOffset = selection.getStartOffset();
        const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
        const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

        return linkKey !== null && contentState.getEntity(linkKey).getType() === 'LINK';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const contentState = editorState.getCurrentContent();
                const newEditorState = imagePlugin.addImage(
                    EditorState.push(editorState, contentState, 'insert-fragment'),
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
        } else if (method === "link") {
            return hasLinkEntity(editorState);
        }
        return false;
    };

    const getButtonStyle = (item) => {
        let baseStyle = `p-2 transition-colors duration-200 hover:text-white focus:outline-none`;

        if ((item.method === "link" && hasLinkEntity(editorState)) ||
            (item.method !== "link" && isActive(item.style, item.method))) {
            return `${baseStyle} text-white bg-red-900 rounded`;
        } else {
            return `${baseStyle} text-red-600`;
        }
    };

    return (
        <div className="p-2 border-b border-gray-800 mb-2">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-2">
                {tools.map((item, idx) => (
                    <button
                        key={`${item.label}-${idx}`}
                        title={item.label}
                        onClick={(e) => applyStyle(e, item.style, item.method)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={getButtonStyle(item)}
                    >
                        {item.icon || item.label}
                    </button>
                ))}
            </div>

            <div className="gap-2 pt-1 border-t border-gray-800">
                <span className="flex items-center mr-2 text-gray-400">
                    Headers:
                </span>
                {headerTools.map((item, idx) => (
                    <button
                        key={`${item.label}-${idx}`}
                        title={item.label}
                        onClick={(e) => applyStyle(e, item.style, item.method)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`${getButtonStyle(item)} ${item.className || ""}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

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