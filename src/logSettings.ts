import * as log from "loglevel";
export { log };

export const setLogLevel = log.setLevel;
export const LogLevels = log.levels;
log.setDefaultLevel(LogLevels.SILENT);
