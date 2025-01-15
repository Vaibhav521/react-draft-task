import React, { useState, useEffect , useRef } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function MyEditor() {


    const editorRef = useRef(null);

    const [editorState, setEditorState] = useState(() => {
        const savedContent = localStorage.getItem('content');
        if (savedContent) {
            try {
                const content = convertFromRaw(JSON.parse(savedContent));
                return EditorState.createWithContent(content);
            } catch (e) {
                return EditorState.createEmpty();
            }
        }
        return EditorState.createEmpty();
    });



    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
    }, []);

    const handleBeforeInput = (char) => {
        if (char !== ' ') return 'not-handled';

        // selectors 
        const selection = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
        const text = currentBlock.getText();


        // actions 
        if (text.startsWith('#')) {
            const newContent = Modifier.replaceText(
                currentContent,
                selection.merge({ anchorOffset: 0, focusOffset: 1 }),
                ''
            );
            let newState = EditorState.push(editorState, newContent, 'remove-range');

            // Toggle header style
            newState = RichUtils.toggleBlockType(newState, 'header-one');

            setEditorState(newState);
            return 'handled';
        }

        if (text.startsWith('*') && text.length === 1) {
            const newContent = Modifier.replaceText(
                currentContent,
                selection.merge({ anchorOffset: 0, focusOffset: 1 }),
                ''
            );
            let newState = EditorState.push(editorState, newContent, 'remove-range');
            newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
            setEditorState(newState);
            return 'handled';
        }

        if (text.startsWith('**') && text.length === 2) {
            const newContent = Modifier.replaceText(
                currentContent,
                selection.merge({ anchorOffset: 0, focusOffset: 2 }),
                ''
            );
            let newState = EditorState.push(editorState, newContent, 'remove-range');
            newState = RichUtils.toggleInlineStyle(newState, 'RED');
            setEditorState(newState);
            return 'handled';
        }

        if (text.startsWith('***') && text.length === 3) {
            const newContent = Modifier.replaceText(
                currentContent,
                selection.merge({ anchorOffset: 0, focusOffset: 3 }),
                ''
            );
            let newState = EditorState.push(editorState, newContent, 'remove-range');
            newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
            setEditorState(newState);
            return 'handled';
        }

        return 'not-handled';
    };

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const handleReturn = (e) => {
        const selection = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(selection.getStartKey());

        if (currentBlock.getType() === 'header-one') {
            const newContent = Modifier.splitBlock(
                currentContent,
                selection
            );

            const blockKey = newContent.getLastBlock().getKey();
            const blockMap = newContent.getBlockMap().set(
                blockKey,
                newContent.getLastBlock().merge({
                    type: 'unstyled'
                })
            );

            const finalContent = newContent.merge({
                blockMap,
                selectionAfter: newContent.getSelectionAfter()
            });

            setEditorState(
                EditorState.push(editorState, finalContent, 'split-block')
            );
            return 'handled';
        }

        return 'not-handled';
    };

    const customStyleMap = {
        'BOLD': {
            fontWeight: 'bold'
        },
        'RED': {
            color: 'red'
        },
        'UNDERLINE': {
            textDecoration: 'underline'
        }
    };

    const blockStyleFn = (contentBlock) => {
        const type = contentBlock.getType();
        if (type === 'header-one') {
            return 'text-3xl font-bold';
        }
        return '';
    };

    const handleSave = () => {
        const contentState = editorState.getCurrentContent();
        const raw = JSON.stringify(convertToRaw(contentState));
        localStorage.setItem('content', raw);
    };

    useEffect(() => {
        const interval = setInterval(handleSave, 30000);
        return () => clearInterval(interval);
    }, [editorState]);

    return (
        <div className="min-h-screen flex flex-col bg-white">

            <div className="border-b border-gray-200 bg-white shadow-sm px-4 py-2 flex justify-between items-center">
                <div className="text-xl font-semibold">Simple Editor</div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Save
                </button>
            </div>

            <div className="flex-grow p-6">
                <div className="border rounded-lg p-4 h-full w-full">
                    <div className="mb-4 text-gray-500">
                        Try typing:
                        <ul className="list-disc ml-5">
                            <li># [space] for heading</li>
                            <li>* [space] for bold</li>
                            <li>** [space] for red</li>
                            <li>*** [space] for underline</li>
                        </ul>
                        <p className="mt-2">Enter new line to end formatting.</p>
                    </div>
                    <Editor
                        editorState={editorState}
                        ref={editorRef}
                        onChange={setEditorState}
                        handleBeforeInput={handleBeforeInput}
                        handleKeyCommand={handleKeyCommand}
                        handleReturn={handleReturn}
                        customStyleMap={customStyleMap}
                        blockStyleFn={blockStyleFn}
                        placeholder="Start typing here..."
                    />
                </div>
            </div>
        </div>
    );
}
