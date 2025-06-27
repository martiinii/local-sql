import { PostgresDatabaseConnection } from "./adapters/postgres";
import type { DatabaseConnection } from "./database-connection";

export const createDatabaseConnection = (
  name: string,
  uri: string,
): DatabaseConnection => {
  const regex = uri.match(/^(.+?):\/\//);
  if (!regex || regex.length < 2) {
    throw new Error(
      "Error while parsing connection URI, schema identifier not found",
    );
  }

  const schemaIdentifier = regex[1].toLowerCase();

  switch (schemaIdentifier) {
    case "postgres":
    case "postgresql": {
      return new PostgresDatabaseConnection(name, uri);
    }
    default: {
      throw new Error(
        `Database "${schemaIdentifier}" is currently not supported`,
      );
    }
  }
};
