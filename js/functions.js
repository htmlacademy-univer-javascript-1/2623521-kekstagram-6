function isLengthWithin(str, max) {
  return String(str).length <= max;
}


function isPalindrome(str) {
  const s = String(str).toLowerCase().replace(/\s/g, '');
  for (let i = 0, j = s.length - 1; i < j; i++, j--) {
    if (s[i] !== s[j]) return false;
  }
  return true;
}


function extractNumber(value) {
  const digits = String(value).match(/\d/g);
  return digits ? Number(digits.join('')) : NaN;
}


console.log('isLengthWithin:', isLengthWithin('проверенная строка', 20), isLengthWithin('проверенная строка', 10));
console.log('isPalindrome:', isPalindrome('топот'), isPalindrome('Доход'), isPalindrome('Кекс'));
console.log('isPalindrome con espacios:', isPalindrome('Лёша на полке клопа нашёл'));
console.log('extractNumber:', extractNumber('2023 год'), extractNumber('кек'), extractNumber(3.5));
