import { LOCAL_SERVER_ID } from "@local-sql/db-types";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../db";
import { createToken } from "../db/helpers/create-token";
import { obfuscateToken } from "../db/helpers/obfuscate-token";
import { accessToken } from "../db/schema/access-token";
import { adapter } from "../lib/adapter";
import { setupPlugin } from "../plugins/setup.plugin";

export const tokenRouter = new Elysia({
  prefix: "/token",
  name: "token",
  tags: ["Token"],
  adapter: adapter,
})
  .use(setupPlugin)
  .get(
    `/${LOCAL_SERVER_ID}`,
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
  .get(
    "/:serverId",
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.token.local.get();
        if (response.error) {
          return status(
            Number(response.error.status) || 500,
            response.error.value,
          );
        }

        return response.data;
      } catch {
        return status(
          503,
          "An error occured while retrieving tokens from remote instance of local-sql server",
        );
      }
    },
    {
      requireToken: "read",
    },
  )
  .post(
    `/${LOCAL_SERVER_ID}`,
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
  .post(
    "/:serverId",
    async ({ params, body, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.token.local.post(body);
        if (response.error) {
          return status(
            Number(response.error.status) || 500,
            response.error.value,
          );
        }

        return response.data;
      } catch {
        return status(
          503,
          "An error occured while creating token on remote instance of local-sql server",
        );
      }
    },
    {
      requireToken: "write",
      body: t.Object({
        permission: t.UnionEnum(["read", "write"]),
      }),
    },
  )
  .put(
    `/${LOCAL_SERVER_ID}/:id`,
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
  .put(
    "/:serverId/:id",
    async ({ body, params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.token
          .local({ id: params.id })
          .put(body);
        if (response.error) {
          return status(
            Number(response.error.status) || 500,
            response.error.value,
          );
        }

        return response.data;
      } catch {
        return status(
          503,
          "An error occured while updating token on remote instance of local-sql server",
        );
      }
    },
    {
      requireToken: "write",
      body: t.Object({
        permission: t.UnionEnum(["read", "write"]),
      }),
    },
  )
  .delete(
    `/${LOCAL_SERVER_ID}/:id`,
    async ({ params }) => {
      await db.delete(accessToken).where(eq(accessToken.id, params.id));
    },
    {
      requireToken: "write",
    },
  )
  .delete(
    "/:serverId/:id",
    async ({ params, store: { servers }, status }) => {
      const server = servers.get(params.serverId);
      if (!server) return status(404, "Server not found");

      if (!server.isConnected) {
        const connectResponse = await server.connect();
        if (!connectResponse.isConnected)
          return status(
            503,
            "An error occured while connecting to remote instance of local-sql server",
          );
      }

      try {
        const response = await server.gatewayApi.token
          .local({ id: params.id })
          .delete();
        if (response.error) {
          return status(
            Number(response.error.status) || 500,
            response.error.value,
          );
        }

        return response.data;
      } catch {
        return status(
          503,
          "An error occured while deleting token on remote instance of local-sql server",
        );
      }
    },
    {
      requireToken: "write",
    },
  );
