import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

export default function AutocompleteInput({
    value,
    onChange,
    options = [],
    placeholder = "Digite para buscar...",
    className = "",
    disabled = false,
    required = false,
    id
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Filter options based on current value, exclude exact match to keep dropdown useful
        if (!value) {
            setFilteredOptions(options.slice(0, 50)); // Show sorted first 50 empty
        } else {
            const term = value.toLowerCase();
            const filtered = options
                .filter(opt => opt.toLowerCase().includes(term))
                .slice(0, 50); // Limit results for performance
            setFilteredOptions(filtered);
        }
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    const handleFocus = () => {
        if (!disabled) setIsOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <Input
                ref={inputRef}
                id={id}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                autoComplete="off"
                className="w-full"
            />

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.map((option, index) => (
                        <div
                            key={`${option}-${index}`}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${option === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                }`}
                            onClick={() => handleSelect(option)}
                        >
                            <span>{option}</span>
                            {option === value && <Check className="w-4 h-4 ml-2" />}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && value && filteredOptions.length === 0 && (
                // Optional: Show "New" hint if no match
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-sm text-gray-500">
                    Nenhum resultado encontrado. Será cadastrado como novo.
                </div>
            )}
        </div>
    );
}
