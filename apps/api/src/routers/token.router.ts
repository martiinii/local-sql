import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { adapter } from "../adapter";
import { db } from "../db";
import { createToken } from "../db/helpers/create-token";
import { obfuscateToken } from "../db/helpers/obfuscate-token";
import { accessToken } from "../db/schema/access-token";
import { setupPlugin } from "../plugins/setup.plugin";

export const tokenRouter = new Elysia({
  prefix: "/token",
  name: "token",
  tags: ["Token"],
  adapter: adapter,
})
  .use(setupPlugin)
  .get(
    "/",
    async () => {
      const tokens = await db.query.accessToken.findMany();

      const obfuscatedTokens = tokens.map(({ token, ...data }) => ({
        ...data,
        token: obfuscateToken(token),
      }));
      return obfuscatedTokens;
    },
    {
      requireToken: "read",
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const [token] = await db
        .insert(accessToken)
        .values({
          token: createToken(),
          allowWrite: body.permission === "write",
        })
        .returning();

      return token;
    },
    {
      requireToken: "write",
      body: t.Object({
        permission: t.UnionEnum(["read", "write"]),
      }),
    },
  )
  .put(
    "/:id",
    async ({ body, params }) => {
      await db
        .update(accessToken)
        .set({
          allowWrite: body.permission === "write",
        })
        .where(eq(accessToken.id, params.id));
    },
    {
      requireToken: "write",
      body: t.Object({
        permission: t.UnionEnum(["read", "write"]),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await db.delete(accessToken).where(eq(accessToken.id, params.id));
    },
    {
      requireToken: "write",
    },
  );
