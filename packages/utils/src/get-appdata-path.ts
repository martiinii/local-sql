import envPaths from "env-paths";

const APPLICATION_NAME = "local-sql";

export const getAppDataPath = () => {
  return envPaths(APPLICATION_NAME).data;
};
