'use client';

import { useState } from 'react';

export interface PhoneToggleProps {
  showPhoneNumbers: boolean;
  setShowPhoneNumbers: (show: boolean) => void;
}

export default function PhoneToggle({ showPhoneNumbers, setShowPhoneNumbers }: PhoneToggleProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center">
        <label htmlFor="phone-toggle" className="relative inline-flex items-center cursor-pointer">
          <input 
            id="phone-toggle" 
            type="checkbox" 
            className="sr-only peer" 
            checked={showPhoneNumbers}
            onChange={() => setShowPhoneNumbers(!showPhoneNumbers)}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Show Phone Numbers</span>
            </div>
          </span>
        </label>
      </div>
    </div>
  );
} 