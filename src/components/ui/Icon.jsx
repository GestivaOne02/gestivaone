import { icons } from "./icons";

export default function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  sx = {},
  style = {},
  strokeWidth,
  stroke,
  fill,
  ...props
}) {
  if (!name) return null;

  const MaterialIcon = icons[name];

  if (!MaterialIcon) {
    console.warn(`[Icon] Icon with name "${name}" not found in icons registry.`);
    return null;
  }

  const combinedSx = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    color: color !== "currentColor" ? color : "inherit",
    verticalAlign: 'middle',
    ...sx
  };

  return (
    <MaterialIcon
      className={className}
      style={style}
      sx={combinedSx}
      {...props}
    />
  );
}
