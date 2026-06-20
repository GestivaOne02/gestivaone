// src/components/Section.jsx
import React from 'react';

/**
 * Section component – reusable wrapper for layout sections.
 * Provides a consistent title style and body text size.
 * Title uses text-sm, font-bold, uppercase for uniform headings.
 * Body defaults to text-xs for legible compact content.
 */
export default function Section({ title, children, className = '' }) {
  return (
    <section className={`mb-4 ${className}`}>
      {title && (
        <h2 className="text-sm font-bold uppercase text-gray-800 mb-2">
          {title}
        </h2>
      )}
      <div className="text-xs text-gray-700">
        {children}
      </div>
    </section>
  );
}
