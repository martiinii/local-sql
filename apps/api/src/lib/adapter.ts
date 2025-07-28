import node from "@elysiajs/node";
import { detectRuntime } from "@local-sql/utils/detect-runtime";
import type { ElysiaAdapter } from "elysia";

const runtime = detectRuntime();

// @ts-expect-error Casting node adapter to ElysiaAdapter causes some errors with missing "stop" property
export const adapter: ElysiaAdapter | undefined =
  runtime === "node" ? node() : undefined;
