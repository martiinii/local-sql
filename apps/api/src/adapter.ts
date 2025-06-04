import node from "@elysiajs/node";
import { detectRuntime } from "@local-sql/utils/detect-runtime";

const runtime = detectRuntime();
export const adapter = runtime === "node" ? node() : undefined;
