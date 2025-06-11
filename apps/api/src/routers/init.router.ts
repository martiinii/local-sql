import { Elysia } from "elysia";
import { adapter } from "../adapter";
import { setupPlugin } from "../plugins/setup.plugin";

export const initRouter = new Elysia({
  prefix: "/init",
  name: "init",
  tags: ["Initialize"],
  adapter: adapter,
})
  .use(setupPlugin)
  .post("/", async ({ store: { servers } }) => {
    const res = await servers.initialize();
    return res;
  });
