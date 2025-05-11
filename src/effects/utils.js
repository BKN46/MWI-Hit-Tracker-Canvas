export function changeColorAlpha(rgba, alpha) {
  if (rgba.startsWith('rgba')) {
    return rgba.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
  } else if (rgba.startsWith('rgb')) {
    return rgba.replace(/rgb\(([^,]+),([^,]+),([^,]+)\)/, `rgba($1,$2,$3,${alpha})`);
  } else if (rgba.startsWith('hsl')) {
    return rgba.replace(/hsl\(([^,]+),([^,]+),([^)]+)\)/, `hsla($1,$2,$3,${alpha})`);
  } else if (rgba.startsWith('hsla')) {
    return rgba.replace(/hsla\(([^,]+),([^,]+),([^)]+),[^)]+\)/, `hsla($1,$2,$3,${alpha})`);
  }
  return rgba;
}

export function getElementCenter(element) {
  const rect = element.getBoundingClientRect();
  if (element.innerText.trim() === '') {
      return {
          x: rect.left + rect.width/2,
          y: rect.top
      };
  }
  return {
      x: rect.left + rect.width/2,
      y: rect.top + rect.height/2
  };
}