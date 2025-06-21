import { init } from "@paralleldrive/cuid2";

export const TOKEN_PREFIX = "lsql";
export const TOKEN_KEY_LENGTH = 64;

const createId = init({
  length: TOKEN_KEY_LENGTH,
});

export const createToken = () => {
  const key = [TOKEN_PREFIX, createId()].join("_");

  return key;
};
