import PropTypes from 'prop-types';

/**
 * Reusable Loader component for loading states
 */
const Loader = ({
  size = 'md',
  fullScreen = false,
  text = '',
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`
        ${sizes[size]}
        border-[var(--color-bg-surface)]
        border-t-[var(--color-primary)]
        rounded-full
        animate-spin
        ${className}
      `}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg-default)]/90 backdrop-blur-sm">
        {spinner}
        {text && (
          <p className="mt-4 text-[var(--color-text-secondary)]">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {spinner}
      {text && (
        <p className="mt-4 text-[var(--color-text-secondary)]">{text}</p>
      )}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Skeleton loader for content placeholders
 */
export const Skeleton = ({
  width = 'full',
  height = '20px',
  rounded = 'md',
  className = '',
}) => {
  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
    full: 'rounded-full',
  };

  return (
    <div
      className={`
        ${typeof width === 'string' && width in widths ? widths[width] : ''}
        ${roundedStyles[rounded]}
        bg-[var(--color-bg-surface)]
        animate-pulse
        ${className}
      `}
      style={{
        height,
        width: typeof width === 'string' && !(width in widths) ? width : undefined,
      }}
    />
  );
};

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
  className: PropTypes.string,
};

export default Loader;
