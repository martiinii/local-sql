import { bearer } from "@elysiajs/bearer";
import Elysia from "elysia";
import { db } from "../db";

export const tokenMacro = new Elysia({
  name: "tokenMacro",
})
  .decorate("requireToken", process.env.REQUIRE_TOKEN === "true")
  .use(bearer())
  .macro({
    requireToken: (permission: "read" | "write") => ({
      beforeHandle: async ({ bearer, requireToken, set, status }) => {
        if (!requireToken && !bearer) {
          return;
        }

        if (!bearer) {
          set.headers["www-authenticate"] =
            `Bearer realm='sign', error="invalid_request"`;
          return status(401, "Token was not provided");
        }

        const token = await db.query.accessToken.findFirst({
          where: {
            token: bearer,
          },
        });

        if (!token) return status(401, "Provided token is invalid");

        if (permission === "write" && !token.allowWrite) {
          return status(
            403,
            "Provided token does not have sufficient permissions",
          );
        }
      },
      resolve: ({ requireToken }) => {
        if (!requireToken)
          return {
            permission: "write" as const,
          };

        return {
          permission:
            permission === "write" ? ("write" as const) : ("read" as const),
        };
      },
    }),
  });
