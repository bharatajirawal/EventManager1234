export default function Button({ children, variant = 'default', ...props }) {
    const baseStyles =
      'px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantStyles = {
      default: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    };
  
    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  