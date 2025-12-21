import React, { useState, useRef, useEffect } from 'react';
import { SkillParameterDefinitionInForm } from '@/types/skills';

interface DescriptionEditorProps {
    value: string;
    onChange: (value: string) => void;
    paramDefs: SkillParameterDefinitionInForm[];
}

export default function DescriptionEditor({ value, onChange, paramDefs }: DescriptionEditorProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 });
    const [selectedIndex, setSelectedIndex] = useState(0); // Track selected item index
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter params that have keys
    const validParams = paramDefs.filter(p => p.key.trim() !== '');

    // Reset selection when suggestions open or params change
    useEffect(() => {
        if (showSuggestions) {
            setSelectedIndex(0);
        }
    }, [showSuggestions, validParams.length]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || validParams.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % validParams.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + validParams.length) % validParams.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            insertParam(validParams[selectedIndex].key);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPos = e.target.selectionStart;

        onChange(newValue);

        // Check if the last typed character was '{'
        // We look at the character just before the cursor
        const charBeforeCursor = newValue.charAt(newCursorPos - 1);

        if (charBeforeCursor === '{') {
            const { caretCoordinates } = getCaretCoordinates(e.target, newCursorPos);

            setSuggestionPos({
                top: caretCoordinates.top + 24, // buffer
                left: caretCoordinates.left
            });
            setShowSuggestions(true);
        } else {
            // Hide if they keep typing something else (unless we want to filter?)
            // For now, let's keep it simple: Hide if they type space or '}'
            if (charBeforeCursor === '}' || charBeforeCursor === ' ') {
                setShowSuggestions(false);
            }
        }
    };

    const insertParam = (paramKey: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBefore = value.substring(0, cursorPos);
        const textAfter = value.substring(cursorPos);

        const newValue = textBefore + paramKey + '}' + textAfter;
        onChange(newValue);
        setShowSuggestions(false);

        // Restore focus and move cursor
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorPos + paramKey.length + 1, cursorPos + paramKey.length + 1);
        });
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <textarea
                ref={textareaRef}
                id="formDescriptionTemplate" // Maintain ID for labels
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rows={6}
                className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 resize-y block w-full font-mono text-sm leading-relaxed"
                style={{ overflowWrap: 'break-word', overflowX: 'hidden', wordBreak: 'break-word' }}
            />



            {/* Autocomplete Dropdown */}
            {showSuggestions && validParams.length > 0 && (
                <div
                    className="absolute z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[150px]"
                    style={{ top: suggestionPos.top, left: suggestionPos.left }}
                >
                    <div className="text-xs text-gray-400 px-2 py-1 border-b border-gray-700 bg-gray-900/50">
                        Insert Parameter
                    </div>
                    {validParams.map((param, index) => (
                        <div
                            key={param.id}
                            onClick={() => insertParam(param.key)}
                            // Changed: Apply bg-blue-600 if index matches selectedIndex
                            className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center group ${index === selectedIndex
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-200 hover:bg-gray-700'
                                }`}
                        >
                            <span>{param.key}</span>
                            <span className={`text-xs ${index === selectedIndex ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                {`{${param.key}}`}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Mirror-div hack to find caret coordinates (simplified)
 * In a real app we might import a small lib, but this is sufficient for a controlled admin area.
 */
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
    const div = document.createElement('div');
    const style = getComputedStyle(element);

    // Copy styles
    Array.from(style).forEach((prop) => {
        div.style.setProperty(prop, style.getPropertyValue(prop), style.getPropertyPriority(prop));
    });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';

    // Content up to caret
    div.textContent = element.value.substring(0, position);

    // Insert a span to get the position
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    document.body.appendChild(div);

    const { offsetLeft: spanLeft, offsetTop: spanTop } = span;

    document.body.removeChild(div);

    // Adjust relative to the element (this is tricky without absolute positioning context of the element itself)
    // For now, let's just use the span's offset relative to the div, which gives us "pixel text coordinates".
    // We will apply this as offset to the textarea's top/left (which we assumed 0,0 relative to parent).

    return {
        caretCoordinates: { top: spanTop, left: spanLeft }
    };
}
