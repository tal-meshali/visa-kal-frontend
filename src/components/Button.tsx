import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'back';
  size?: 'default' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const variantClassMap: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    back: 'btn-back',
  };
  
  const baseClass = 'btn';
  const variantClass = variantClassMap[variant] || 'btn-primary';
  const sizeClass = size === 'large' ? 'btn-large' : '';
  const widthClass = fullWidth ? 'btn-full-width' : '';
  const additionalClasses = className ? className : '';

  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    additionalClasses,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

