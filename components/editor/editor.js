import React, { useEffect, useRef, useState } from "react";
import { EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier } from "draft-js";
import Toolbar from "./toolbar";
import createImagePlugin from "@draft-js-plugins/image";
import Editor from "@draft-js-plugins/editor";
import "@draft-js-plugins/image/lib/plugin.css";
import { stateToHTML } from 'draft-js-export-html';

// Initialize the image plugin
const imagePlugin = createImagePlugin();
const plugins = [imagePlugin];

export const exportOptions = {
    inlineStyles: {
        BOLD: {element: 'strong', style: {color: '#af0000', fontWeight: 'bold'}},
        RED_BOLD: {element: 'strong', style: {color: '#af0000', fontWeight: 'bold'}},
        ITALIC: {element: 'em'},
        UNDERLINE: {element: 'u'},
        HIGHLIGHT: {element: 'span', style: {backgroundColor: '#900000'}},
        SUPERSCRIPT: {element: 'sup'},
        SUBSCRIPT: {element: 'sub'},
        STRIKETHROUGH: {element: 's'},
        CODE: {element: 'code', style: {display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.05)', fontFamily: 'monospace', padding: '0.5em'}},
    },
    blockStyleFn: (block) => {
        const type = block.getType();
        if (type === 'blockquote') {
            return {
                style: {
                    borderLeft: '4px solid #dc2626',
                    paddingLeft: '1rem',
                    fontStyle: 'italic',
                    fontSize: '1.25rem',
                    color: '#ffffff'
                }
            };
        }
        if (type === 'code-block') {
            return {
                element: 'pre',
                style: {
                    fontFamily: 'monospace',
                    backgroundColor: '#f8cecc',
                    padding: '1em',
                    borderRadius: '0.375rem'
                }
            };
        }
        if (type.startsWith('header-')) {
            const level = type.charAt(7);
            return {
                element: `h${level}`,
                style: level === '1' ? { fontFamily: 'var(--font-heading), serif' } : {}
            };
        }
        // Add text alignment styles
        if (type === 'leftAlign') {
            return {
                style: { textAlign: 'left', color: '#c3c3c3' }
            };
        }
        if (type === 'centerAlign') {
            return {
                style: { textAlign: 'center', color: '#c3c3c3' }
            };
        }
        if (type === 'rightAlign') {
            return {
                style: { textAlign: 'right', color: '#c3c3c3' }
            };
        }
        if (type === 'justifyAlign') {
            return {
                style: { textAlign: 'justify', color: '#c3c3c3' }
            };
        }
        return {
            style: { color: '#c3c3c3' } // Default text color
        };
    }
}

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

    // Custom inline styles that match the actual document styles
    const styleMap = {
        BOLD: {
            color: "#af0000", // Using the text-bold color from tailwind config
            fontWeight: "bold"
        },
        RED_BOLD: {
            color: "#af0000", // Using the text-bold color from tailwind config
            fontWeight: "bold"
        },
        ITALIC: {
            fontStyle: "italic"
        },
        UNDERLINE: {
            textDecoration: "underline"
        },
        CODE: {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            fontFamily: "monospace",
            fontSize: "0.875rem", // theme(fontSize.sm)
            padding: "0.5rem", // theme(spacing.2)
        },
        HIGHLIGHT: {
            backgroundColor: "#900000"
        },
        UPPERCASE: {
            textTransform: "uppercase"
        },
        LOWERCASE: {
            textTransform: "lowercase"
        },
        SUPERSCRIPT: {
            verticalAlign: "super",
            fontSize: "0.75rem" // theme(fontSize.xs)
        },
        SUBSCRIPT: {
            verticalAlign: "sub",
            fontSize: "0.75rem" // theme(fontSize.xs)
        },
        TITLE: {
            color: "#ffffff" // theme(colors.text.title)
        },
        MUTED: {
            color: "#c3c3c3" // theme(colors.text.muted)
        },
        STRIKETHROUGH: {
            textDecoration: "line-through"
        },
        BODY: {
            fontFamily: "var(--font-body), 'Noto Serif', serif"
        },
        CARD: {
            backgroundColor: "#1a1a1a", // theme(colors.card)
            borderRadius: "0.375rem", // theme(borderRadius.md)
            padding: "1rem" // theme(spacing.4)
        },
    };

    // Function to apply text transformation (uppercase/lowercase)
    const applyTextTransform = (transform) => {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
        const start = selection.getStartOffset();
        const end = selection.getEndOffset();
        const selectedText = currentBlock.getText().slice(start, end);

        if (selectedText) {
            let transformedText;
            if (transform === 'UPPERCASE') {
                transformedText = selectedText.toUpperCase();
            } else if (transform === 'LOWERCASE') {
                transformedText = selectedText.toLowerCase();
            } else {
                return;
            }

            const newContentState = Modifier.replaceText(
                contentState,
                selection,
                transformedText
            );

            const newEditorState = EditorState.push(
                editorState,
                newContentState,
                'apply-text-transform'
            );

            setEditorState(newEditorState);
        }
    };

    // Custom block styles that match the document styles
    const myBlockStyleFn = (contentBlock) => {
        const type = contentBlock.getType();
        switch (type) {
            case "blockquote":
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
                return "font-bold text-text-bold";
            case "code-block":
                return "bg-red-100 dark:bg-red-800 font-mono italic leading-relaxed p-3 px-4 rounded-md";
            case "header-one":
                return "text-4xl font-bold font-heading";
            case "header-two":
                return "text-3xl font-bold";
            case "header-three":
                return "text-2xl font-bold";
            case "header-four":
                return "text-xl font-bold";
            case "header-five":
                return "text-lg font-bold";
            case "header-six":
                return "text-base font-bold";
            case "unordered-list-item":
                return "list-disc ml-5";
            case "ordered-list-item":
                return "list-decimal ml-5";
            default:
                return "text-text"; // Default text color from tailwind
        }
    };

    return (
        <div className="mt-2 p-3 w-full bg-background border border-red-600 rounded-lg text-text focus:ring-2 focus:ring-red-500" onClick={focusEditor}>
            <Toolbar
                imagePlugin={imagePlugin}
                editorState={editorState}
                setEditorState={setEditorState}
                onImageUpload={onImageUpload}
                applyTextTransform={applyTextTransform}
            />
            <div className="editor-container bg-background p-4 rounded-lg border-2 border-gray-800 font-body">
                <Editor
                    ref={editor}
                    placeholder="Write Here"
                    handleKeyCommand={handleKeyCommand}
                    editorState={editorState}
                    customStyleMap={styleMap}
                    blockStyleFn={myBlockStyleFn}
                    onChange={(editorState) => {
                        const contentState = editorState.getCurrentContent();
                        console.log("contentSTate: ", convertToRaw(contentState));
                        console.log(stateToHTML(contentState, exportOptions));
                        setEditorState(editorState);
                    }}
                    plugins={plugins} // Apply the image plugin
                />
            </div>
        </div>
    );
};

export default DraftEditor;