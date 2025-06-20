import { init } from "@paralleldrive/cuid2";

const TOKEN_PREFIX = "lsql";
const TOKEN_LENGTH = 64;

const createId = init({
  length: TOKEN_LENGTH,
});

export const createToken = () => {
  const key = [TOKEN_PREFIX, createId()].join("_");

  return key;
};
