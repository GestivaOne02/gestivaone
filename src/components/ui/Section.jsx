import React from 'react';

/**
 * Section component – reusable wrapper for UI sections.
 * Provides a consistent title style and body text size.
 */
export default function Section({ title, children, className = '' }) {
  return (
    <section className={`mb-4 ${className}`}>
      {title && (
        <h2 className="text-sm font-bold uppercase text-gray-800 dark:text-gray-200 mb-2">
          {title}
        </h2>
      )}
      <div className="text-xs text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </section>
  );
}
