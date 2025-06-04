import { Elysia, t } from "elysia";
import { adapter } from "../adapter";
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
    ({ body, store: { databases } }) => {
      return databases.add(body.databases);
    },
    {
      body: t.Object({
        databases: t.Array(
          t.Object({
            name: t.String(),
            uri: t.String(),
          }),
        ),
      }),
    },
  );
