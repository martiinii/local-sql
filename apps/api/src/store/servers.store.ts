import Elysia from "elysia";
import { Servers } from "../databases/servers";

export const serversStore = new Elysia({ name: "servers-store" }).state(
  "servers",
  new Servers(),
);
