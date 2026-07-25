import React from 'react';
import { icons } from "./icons";

export default function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
  style = {},
  sx = {},
  ...props
}) {
  if (!name) return null;

  const Component = icons[name];

  if (!Component) {
    console.warn(`[Icon] Icon with name "${name}" not found in icons registry.`);
    return null;
  }

  // Handle both standard inline styles and legacy sx object
  const combinedStyle = {
    ...style,
    ...(sx.color ? { color: sx.color } : {}),
  };

  const computedSize = typeof size === 'number' ? size : parseInt(size) || 24;

  return (
    <Component
      size={computedSize}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={combinedStyle}
      {...props}
    />
  );
}
