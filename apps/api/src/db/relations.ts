import { defineRelations } from "drizzle-orm";
import * as accessTokenSchema from "./schema/access-token";
import * as connectionSchema from "./schema/connection";
import * as serverSchema from "./schema/server";

const schema = {
  ...accessTokenSchema,
  ...connectionSchema,
  ...serverSchema,
};

export const relations = defineRelations(schema);
export type Relations = typeof relations;
