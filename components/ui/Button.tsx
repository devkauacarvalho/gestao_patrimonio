
import React from 'react';
import { ACCENT_COLOR_CLASS_BG, ACCENT_COLOR_CLASS_HOVER_BG, ACCENT_COLOR_NAME, ACCENT_COLOR_CLASS_TEXT } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = "font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out inline-flex items-center justify-center";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary: `${ACCENT_COLOR_CLASS_BG} text-white ${ACCENT_COLOR_CLASS_HOVER_BG} focus:ring-${ACCENT_COLOR_NAME}-500`, // ACCENT_COLOR_NAME was used here directly
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: `${ACCENT_COLOR_CLASS_TEXT} hover:bg-${ACCENT_COLOR_NAME}-100 focus:ring-${ACCENT_COLOR_NAME}-500`, // ACCENT_COLOR_NAME was used here directly
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
