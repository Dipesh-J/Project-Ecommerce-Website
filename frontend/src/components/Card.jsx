import PropTypes from 'prop-types';

/**
 * Reusable Card component for displaying content in a contained box
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = `
    rounded-[var(--radius-lg)]
    transition-all duration-300 ease-in-out
  `;

  const variants = {
    default: 'bg-[var(--color-bg-surface)]',
    outlined: 'bg-transparent border border-[var(--color-bg-surface)]',
    elevated: 'bg-[var(--color-bg-surface)] shadow-[var(--shadow-navbar)]',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hoverable
    ? 'cursor-pointer hover:translate-y-[-4px] hover:shadow-lg hover:border-[var(--color-primary)]'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  hoverable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
