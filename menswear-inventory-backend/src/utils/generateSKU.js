export const generateSKU = ({ categoryName, color, size }) => {
  const categoryCode = categoryName.slice(0, 2).toUpperCase(); // JE → jeans
  const colorCode = color.slice(0, 3).toUpperCase(); // BLA → black

  return `${categoryCode}-${colorCode}-${size}`;
};
