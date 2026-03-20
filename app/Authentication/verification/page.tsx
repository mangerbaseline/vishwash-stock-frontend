'use client';

import React, { useRef } from 'react';

export default function VerifyAccount() {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      if (index < 3) inputsRef.current[index + 1]?.focus();
    } else {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg px-6 py-10 sm:px-8 w-full max-w-md text-center border border-gray-200 dark:border-gray-700">

        {/* Logo + Heading */}
        <div className="mb-4">
          <h3 className='text-3xl font-semibold pb-3'>NextAdmin</h3>
          <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            Verify Your Account
          </h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter the 4 digit code sent to the registered email id.
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-3 mb-4">
          {[0, 1, 2, 3].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              onChange={(e) => handleChange(index, e)}
              className="w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 dark:border-gray-600 rounded-md text-center text-xl font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        {/* Resend */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Did not receive a code?
          <button className="text-indigo-600 font-medium ml-1 hover:underline">
            Resend
          </button>
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 bg-[#635BFF] hover:bg-[#4f47e4] text-white py-2 rounded-md font-semibold text-sm transition"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
