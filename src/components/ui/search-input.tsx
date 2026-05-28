'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { debounce } from '@/lib/utils/debounce';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  debounceMs?: number;
  id?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  debounceMs = 300,
  id = 'search',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useMemo(
    () => debounce((query: string) => onChange(query), debounceMs),
    [onChange, debounceMs]
  );

  useEffect(() => {
    // eslint-disable-next-line
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <label htmlFor={id} className="absolute left-3 text-muted-foreground">
        <Search className="h-4 w-4" aria-hidden />
      </label>
      <Input
        id={id}
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className={`pl-10 ${inputClassName}`}
        aria-label={placeholder}
      />
    </div>
  );
}
