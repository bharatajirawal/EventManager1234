export default function Input({ ...props }) {
    return (
      <input
        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 placeholder-gray-500"
        {...props}
      />
    );
  }
  