import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center w-full h-full min-h-[300px]">
            {/* The SVG is a stylized Kettlebell icon */}
            <svg
                className="animate-spin h-10 w-10 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                {/* Kettlebell Handle */}
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4a3 3 0 100 6 3 3 0 000-6z"
                />
                {/* Kettlebell Body (Bell Shape) */}
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v10M8 17h8"
                />
            </svg>
            <p className="ml-3 text-lg font-semibold text-slate-300">Loading AMRAP Data...</p>
        </div>
    );
};

export default LoadingSpinner;