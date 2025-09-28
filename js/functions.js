function isLengthWithin(str, max) {
  return String(str).length <= max;
}

function isPalindrome(str) {
  const s = String(str).toLowerCase().replace(/\s/g, '');
  for (let i = 0, j = s.length - 1; i < j; i += 1, j -= 1) {
    if (s[i] !== s[j]) {
      return false;
    }
  }
  return true;
}

// Opcional
function extractNumber(value) {
  const digits = String(value).match(/\d/g);
  return digits ? Number(digits.join('')) : NaN;
}
