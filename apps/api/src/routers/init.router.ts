import { Elysia } from "elysia";
import { adapter } from "../lib/adapter";
import { setupPlugin } from "../plugins/setup.plugin";

export const initRouter = new Elysia({
  prefix: "/init",
  name: "init",
  tags: ["Initialize"],
  adapter: adapter,
})
  .use(setupPlugin)
  .post(
    "/",
    async ({ store: { servers } }) => {
      const res = await servers.initialize();
      return res;
    },
    {
      requireToken: "read",
      detail: {
        summary: "Initialize server instance",
        description:
          "Queries remote instances of local-sql, establishes connections and fetches local and remote connections",
      },
    },
  );
