
import React from 'react';
import { ACCENT_COLOR_NAME } from '../../constants';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string; // Added placeholder prop
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, placeholder, containerClassName = '', className='', ...props }) => {
  const baseSelectClasses = `mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
  focus:outline-none focus:border-${ACCENT_COLOR_NAME}-500 focus:ring-1 focus:ring-${ACCENT_COLOR_NAME}-500`;
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${baseSelectClasses} ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>} 
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
