import { TOKEN_KEY_LENGTH, TOKEN_PREFIX } from "./create-token";

// You can adjust these constants
const tokenVisibleLength = 5;
const tokenAsteriskLength = 8;

// Calculations
const TOKEN_VISIBLE_WITH_PREFIX_LENGTH =
  TOKEN_PREFIX.length + Math.min(tokenVisibleLength, TOKEN_KEY_LENGTH) + 1; // +1 for underscore

export const obfuscateToken = (token: string) => {
  return (
    token.slice(0, TOKEN_VISIBLE_WITH_PREFIX_LENGTH) +
    "*".repeat(tokenAsteriskLength)
  );
};
