export function changeColorAlpha(rgba, alpha) {
  return rgba.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
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