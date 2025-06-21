import { TOKEN_KEY_LENGTH, TOKEN_PREFIX } from "./create-token";

// You can modify this length
const tokenVisibleLength = 5;

// Calculations
const TOKEN_FULL_LENGTH = TOKEN_KEY_LENGTH + TOKEN_PREFIX.length + 1;
const TOKEN_VISIBLE_WITH_PREFIX_LENGTH =
  Math.min(tokenVisibleLength, TOKEN_KEY_LENGTH) +
  TOKEN_FULL_LENGTH -
  TOKEN_KEY_LENGTH;
const TOKEN_REMAINDER_LENGTH =
  TOKEN_FULL_LENGTH - TOKEN_VISIBLE_WITH_PREFIX_LENGTH;

export const obfuscateToken = (token: string) => {
  return (
    token.slice(0, TOKEN_VISIBLE_WITH_PREFIX_LENGTH) +
    "*".repeat(TOKEN_REMAINDER_LENGTH)
  );
};
