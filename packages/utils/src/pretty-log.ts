import chalk from "chalk";

export type LoggerType = typeof console.log;

const getCurrentTime = () => new Date().toISOString();

export const createPrettyLogger = (prefix: string): LoggerType => {
  const prefixStr = chalk.black(`[${prefix}]`);
  const time = chalk.dim(getCurrentTime());

  return (...data) => console.log(`${time} ${prefixStr}`, ...data);
};
