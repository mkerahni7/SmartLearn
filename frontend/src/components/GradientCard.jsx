import React from 'react';
import { motion } from 'framer-motion';

/**
 * GradientCard - Animated card with gradient accent
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 */
const GradientCard = ({
  title,
  subtitle,
  children,
  className = '',
  icon: Icon,
  gradient = 'primary'
}) => {
  const gradientMap = {
    primary: 'bg-gradient-primary',
    success: 'bg-gradient-success',
    warning: 'bg-gradient-warning',
    secondary: 'bg-gradient-secondary'
  };

  return (
    <motion.div
      className={`card surface-hover ${className}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6 }}
    >
      {(title || Icon) && (
        <div className="card-header">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`icon-bubble ${gradientMap[gradient]}`}>
                <Icon size={22} />
              </div>
            )}
            {title && <h3 className="card-title">{title}</h3>}
          </div>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
    </motion.div>
  );
};

export default GradientCard;


