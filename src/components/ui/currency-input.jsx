import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";

const CurrencyInput = ({ value, onChange, disabled, className, ...props }) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value !== undefined && value !== null) {
            // Format initial value
            const formatted = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
            setDisplayValue(formatted);
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Remove non-numeric characters
        const numericValue = inputValue.replace(/\D/g, '');

        // Convert to float (divide by 100 to handle cents)
        const floatValue = parseFloat(numericValue) / 100;

        if (isNaN(floatValue)) {
            onChange(0);
            return;
        }

        onChange(floatValue);
    };

    return (
        <Input
            {...props}
            type="text"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            className={className}
            placeholder="R$ 0,00"
        />
    );
};

export default CurrencyInput;
