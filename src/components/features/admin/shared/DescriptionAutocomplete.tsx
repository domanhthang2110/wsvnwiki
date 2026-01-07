import React, { useState, useRef, useEffect } from 'react';

interface Parameter {
    id: string;
    key: string;
}

interface DescriptionAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    parameters: Parameter[];
    placeholder?: string;
    rows?: number;
}

export default function DescriptionAutocomplete({
    value,
    onChange,
    parameters,
    placeholder = 'Enter skill description...',
    rows = 6
}: DescriptionAutocompleteProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [cursorPos, setCursorPos] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter parameters based on search term (exclude PvP variants)
    const filteredParams = parameters
        .filter(p => !p.key.endsWith('_pvp'))
        .filter(p => p.key.toLowerCase().includes(searchTerm.toLowerCase()));

    // Reset selected index when filtered list changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm]);

    // Scroll selected item into view
    useEffect(() => {
        if (showDropdown && dropdownRef.current) {
            const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex, showDropdown]);

    const calculateDropdownPosition = () => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;

        // Get the text before cursor and count newlines to determine line number
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        const currentLineText = lines[currentLine];

        // Get computed styles
        const computed = window.getComputedStyle(textarea);
        const lineHeight = parseInt(computed.lineHeight) || 20;
        const paddingTop = parseInt(computed.paddingTop) || 0;

        // Calculate approximate position
        // Top: line number * line height + padding
        const top = (currentLine * lineHeight) + paddingTop + lineHeight;

        // Left: approximate character position (rough estimate)
        // Use a more accurate measurement with canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = computed.font;
            const textWidth = context.measureText(currentLineText).width;
            const paddingLeft = parseInt(computed.paddingLeft) || 0;
            setDropdownPosition({ top, left: Math.min(textWidth + paddingLeft, 300) });
        } else {
            setDropdownPosition({ top, left: 0 });
        }
    };

    const insertParam = (paramKey: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Find the start of the current parameter input (after the last {)
        const beforeCursor = value.substring(0, start);
        const lastBraceIndex = beforeCursor.lastIndexOf('{');

        if (lastBraceIndex === -1) return;

        // Replace from { to cursor with {paramKey}
        const newValue =
            value.substring(0, lastBraceIndex) +
            `{${paramKey}}` +
            value.substring(end);

        onChange(newValue);
        setShowDropdown(false);
        setSearchTerm('');

        // Set cursor after the inserted parameter
        setTimeout(() => {
            const newCursorPos = lastBraceIndex + paramKey.length + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const pos = textarea.selectionStart;

        // Detect { character to show dropdown
        if (e.key === '{') {
            setTimeout(() => {
                setShowDropdown(true);
                setSearchTerm('');
                setCursorPos(pos + 1);
                calculateDropdownPosition();
            }, 0);
        }

        // Handle dropdown navigation
        if (showDropdown) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredParams.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && filteredParams.length > 0) {
                e.preventDefault();
                insertParam(filteredParams[selectedIndex].key);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowDropdown(false);
                setSearchTerm('');
            } else if (e.key === '}') {
                // Close dropdown when } is typed
                setShowDropdown(false);
                setSearchTerm('');
            }
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (showDropdown) {
            const pos = e.target.selectionStart;
            const beforeCursor = newValue.substring(0, pos);

            // Extract search term after the last {
            const match = beforeCursor.match(/\{([^}]*)$/);

            if (match) {
                setSearchTerm(match[1]);
                calculateDropdownPosition();
            } else {
                setShowDropdown(false);
                setSearchTerm('');
            }
        }
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showDropdown && filteredParams.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    style={{
                        top: `${dropdownPosition.top + 8}px`,
                        left: `${dropdownPosition.left}px`
                    }}
                >
                    {filteredParams.map((param, idx) => (
                        <button
                            key={param.id}
                            type="button"
                            onClick={() => insertParam(param.key)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${idx === selectedIndex ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
                                }`}
                        >
                            <code className="font-mono">{`{${param.key}}`}</code>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && filteredParams.length === 0 && searchTerm && (
                <div
                    className="absolute z-50 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg"
                    style={{
                        top: `${dropdownPosition.top + 8}px`,
                        left: `${dropdownPosition.left}px`
                    }}
                >
                    <div className="px-3 py-2 text-gray-400 text-sm">
                        No parameters found for &quot;{searchTerm}&quot;
                    </div>
                </div>
            )}

            <div className="mt-2 text-xs text-gray-400">
                <p>
                    Type <code className="bg-gray-800 px-1 rounded">{`{`}</code> to insert a parameter.
                    Use <code className="bg-gray-800 px-1 rounded">&lt;pvp_icon&gt;</code> for the PvP icon.
                </p>
            </div>
        </div>
    );
}
