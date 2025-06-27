// This env is replaced by build script to true
export const IS_BUNDLED =
  (process.env.IS_BUNDLED as unknown as boolean) === true;
