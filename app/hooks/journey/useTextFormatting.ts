import { useRef, useState } from 'react';

export type FormatType = 'bold' | 'italic' | 'underline' | 'strike' | 'title' | 'heading' | 'subheading' | 'body' | 'bullet' | 'numbered' | 'quote';

interface UseTextFormattingProps {
    content: string;
    setContent: (content: string) => void;
    editorRef: React.RefObject<any>;
}

export const useTextFormatting = ({ content, setContent, editorRef }: UseTextFormattingProps) => {
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const selectionRef = useRef({ start: 0, end: 0 });
    const [showFormatMenu, setShowFormatMenu] = useState(false);

    const applyFormat = (type: FormatType) => {
        const { start, end } = selectionRef.current;
        let prefix = '';
        let suffix = '';

        switch (type) {
            case 'bold': prefix = '**'; suffix = '**'; break;
            case 'italic': prefix = '_'; suffix = '_'; break;
            case 'underline': prefix = '<u>'; suffix = '</u>'; break;
            case 'strike': prefix = '~~'; suffix = '~~'; break;
            case 'title': prefix = '# '; break;
            case 'heading': prefix = '## '; break;
            case 'subheading': prefix = '### '; break;
            case 'bullet': prefix = '• '; break;
            case 'numbered': prefix = '1. '; break;
            case 'quote': prefix = '> '; break;
            case 'body': prefix = ''; break;
        }

        let newContent = content;
        if (['title', 'heading', 'subheading', 'bullet', 'numbered', 'quote', 'body'].includes(type)) {
            const lines = content.split('\n');
            let currentPos = 0;
            const newLines = lines.map(line => {
                const lineStart = currentPos;
                const lineEnd = currentPos + line.length;
                currentPos = lineEnd + 1;

                if (start >= lineStart && start <= lineEnd) {
                    let cleanedLine = line.replace(/^(#+\s*|•\s*|\d+\.\s*|>\s*|<u>|<\/u>)/g, '').trim();
                    if (type === 'body') return cleanedLine;
                    return prefix + cleanedLine;
                }
                return line;
            });
            newContent = newLines.join('\n');
        } else {
            const selectedText = content.substring(start, end);
            newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
        }

        setContent(newContent);
        setTimeout(() => editorRef.current?.focus(), 100);

        if (!['bold', 'italic', 'underline', 'strike'].includes(type)) {
            setShowFormatMenu(false);
        }
    };

    const handleSelectionChange = (e: any) => {
        const newSelection = e.nativeEvent.selection;
        selectionRef.current = newSelection;
        setSelection(newSelection);
    };

    return {
        selection,
        selectionRef,
        showFormatMenu,
        setShowFormatMenu,
        applyFormat,
        handleSelectionChange
    };
};
