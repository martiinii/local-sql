export type Runtime = "node" | "bun";

export const detectRuntime = (): Runtime => {
  if (process.versions?.bun || typeof Bun !== "undefined") {
    return "bun";
  }

  return "node";
};
