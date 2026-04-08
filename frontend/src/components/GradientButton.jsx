import React from 'react';
import { motion } from 'framer-motion';

/**
 * GradientButton - Modern animated button component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant
 * @param {string} props.gradient - Gradient type (primary, success, warning, secondary)
 * @param {React.ReactNode} props.children - Button content
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional classes
 */
const GradientButton = ({ 
  variant = 'primary', 
  gradient = 'primary',
  children, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const gradientMap = {
    primary: 'bg-gradient-primary',
    success: 'bg-gradient-success',
    warning: 'bg-gradient-warning',
    secondary: 'bg-gradient-secondary'
  };

  return (
    <motion.button
      className={`btn btn-${variant} ${gradientMap[gradient]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GradientButton;


