/**
 * src/utils/morse.js — Morse encode/decode for live preview and speech validation.
 * ^ = dot  ~ = dash  | = word space for frontend context
 */

const specialChars = {
  "1":"^~~~~", "2":"^^~~~", "3":"^^^~~", "4":"^^^^~", "5":"^^^^^",
  "6":"~^^^^", "7":"~~^^^", "8":"~~~^^", "9":"~~~~^", "0":"~~~~~",
  " ":"|", ".":"^~^~^~", ",":"~~^^~~", "?":"^^~~^^", "'":"^~~~~^",
  "!":"~^~^~~", "/":"~^^~^", "(":"~^~~^", ")":"~^~~^~", "&":"^~^^^",
  ":":"~~~^^^", ";":"~^~^~^", "=":"~^^^~", "+":"^~^~^", "-":"~^^^^~",
  "_":"^^~~^~", '"':"^~^^~^", "$":"^^^~^^~", "@":"^~~^~^", "Á":"^~^~~",
  "Ä":"^~^~", "Å":"^~^~~", "Ñ":"~~^~~", "Ü":"^^~~"
};

const englishBase = {
  A:"^~", B:"~^^^", C:"~^~^", D:"~^^", E:"^", F:"^^~^", G:"~~^", H:"^^^^",
  I:"^^", J:"^~~~", K:"~^~", L:"^~^^", M:"~~", N:"~^", O:"~~~", P:"^~~^",
  Q:"~~^~", R:"^~^", S:"^^^", T:"~", U:"^^~", V:"^^^~", W:"^~~", X:"~^^~",
  Y:"~^~~", Z:"~~^^"
};

export const MORSE_CODES = {
  english: { ...englishBase, ...specialChars },
  
  french: {
    ...englishBase,
    ...specialChars,
    "É":"^^~^^", "È":"^~^^~", "À":"^~~^~", "Ç":"~^~^^", "Ù":"^^~~", "Ô":"~~~^",
    "Û":"^^~~", "Î":"^^~~^"
  },
  
  hindi: {
    ...englishBase,
    ...specialChars,
    // Devanagari standalone vowels (all unique 6-char codes)
    "अ":"~~~~~~", "आ":"~~~~~^", "इ":"~~~~^~", "ई":"~~~~^^",
    "उ":"~~~^~~", "ऊ":"~~~^~^", "ए":"~~~^^~", "ऐ":"~~^~~~",
    "ओ":"~~^~~^", "औ":"~~^~^~",
    // Devanagari consonants (all unique 6-char codes)
    "क":"~~^~^^", "ख":"~~^^~^", "ग":"~~^^^~", "घ":"~~^^^^",
    "च":"~^~~~~", "छ":"~^~~~^", "ज":"~^~~^^", "झ":"~^~^^~",
    "ञ":"~^~^^^", "ट":"~^^~~~", "ठ":"~^^~~^", "ड":"~^^~^~",
    "ढ":"~^^~^^", "ण":"~^^^~~", "त":"~^^^~^", "थ":"~^^^^^",
    "द":"^~~~~~", "ध":"^~~~^~", "न":"^~~~^^", "प":"^~~^~~",
    "फ":"^~~^^~", "ब":"^~~^^^", "भ":"^~^~~~", "म":"^~^~~^",
    "य":"^~^~^^", "र":"^~^^~~", "ल":"^~^^^~", "व":"^~^^^^",
    "श":"^^~~~~", "ष":"^^~~~^", "स":"^^~^~~", "ह":"^^~^~^",
    "ङ":"^^~^^~",
    // Devanagari matras (vowel signs)
    "ा":"^^~^^^", "ि":"^^^~~~", "ी":"^^^~~^", "ु":"^^^~^~",
    "ू":"^^^~^^", "ृ":"^^^^~~", "े":"^^^^~^", "ै":"^^^^^~",
    "ो":"^^^^^^", "ौ":"~^^^^^",
    // Devanagari combining marks (7-char codes to avoid collisions)
    "्":"~^^^^^^", "ं":"^~~~~~~", "ः":"^^~^^^^", "ँ":"~~~^^^^"
  },
  
  marathi: {}, // Will be aliased to Hindi
};

// Alias Marathi to Hindi
MORSE_CODES.marathi = MORSE_CODES.hindi;

// Backwards compatibility for Chat live preview (defaults to English)
export function encodeToMorse(text) {
  if (!text) return '';
  const map = MORSE_CODES.english;
  return text.toUpperCase().split('')
    .map(ch => map[ch] ?? '')
    .filter(Boolean)
    .join(' ');
}

export function decodeFromMorse(morse) {
  if (!morse) return '';
  const REVERSE_MAP = Object.fromEntries(
    Object.entries(MORSE_CODES.english).map(([k, v]) => [v, k])
  );
  return morse.split(' ')
    .map(code => REVERSE_MAP[code] ?? (code === '' ? '' : '?'))
    .join('');
}

export function strictEncodeToMorse(text, language = "english") {
  if (!text || !text.trim()) return '';
  const map = MORSE_CODES[language] || MORSE_CODES.english;
  const upper = text.toUpperCase();
  const encoded = [];
  
  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    if (map[ch] === undefined) {
      throw new Error(`Unsupported character detected: "${ch}"`);
    }
    encoded.push(map[ch]);
  }
  
  return encoded.join(' ');
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(MORSE_CODES);
}

/**
 * Get language name from code
 */
export function getLanguageName(code) {
  const languageNames = {
    english: "English",
    french: "French",
    hindi: "Hindi",
    marathi: "Marathi"
  };
  return languageNames[code.toLowerCase()] || "Unknown";
}

/**
 * Check if a character is supported in a language
 */
export function isCharacterSupported(char, language) {
  const map = MORSE_CODES[language] || MORSE_CODES.english;
  return char.toUpperCase() in map;
}

/**
 * Encode with full language support
 */
export function encodeWithLanguage(text, language = "english") {
  if (!text || !text.trim()) return '';
  const map = MORSE_CODES[language] || MORSE_CODES.english;
  const upper = text.toUpperCase();
  return Array.from(upper)
    .map((ch) => map[ch] || "")
    .filter(Boolean)
    .join(" ");
}

/**
 * Decode with full language support
 */
export function decodeWithLanguage(morseCode, language = "english") {
  if (!morseCode || !morseCode.trim()) return '';
  const map = MORSE_CODES[language] || MORSE_CODES.english;
  const reverse = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [v, k])
  );
  return morseCode
    .split(" ")
    .map((code) => reverse[code] || "")
    .filter(Boolean)
    .join("");
}
