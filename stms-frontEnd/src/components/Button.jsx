import React from 'react';

const Button = ({ text, onClick, variant = 'primary', type = 'button', className = '' }) => {
    const baseStyle = "px-4 py-2 rounded-md font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "bg-amber-50 text-emerald-900 border border-emerald-200 hover:bg-amber-100 focus:ring-emerald-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        brand: "bg-emerald-900 text-amber-50 hover:bg-emerald-800 focus:ring-emerald-500 shadow-md",
    };

    return (
        <button
            type={type}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {text}
        </button>
    );
};

export default Button;
