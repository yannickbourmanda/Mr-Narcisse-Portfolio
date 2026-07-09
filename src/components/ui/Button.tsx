import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  type?: 'submit' | 'reset' | 'button';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase transition-all duration-300";
  
  const variants = {
    primary: "bg-gold hover:bg-white text-navy-dark shadow-[0_10px_30px_rgba(197,160,89,0.2)]",
    secondary: "bg-navy-light hover:bg-white text-white hover:text-navy-dark border border-white/10",
    outline: "border border-gold text-gold hover:bg-gold hover:text-navy-dark",
    ghost: "text-white/60 hover:text-gold border-b border-white/20 hover:border-gold pb-1 rounded-none",
  };

  const sizes = {
    sm: "px-6 py-3",
    md: "px-10 py-5",
    lg: "px-12 py-6",
  };

  const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link to={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
