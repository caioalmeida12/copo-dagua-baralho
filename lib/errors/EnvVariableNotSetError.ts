import EnvFile from "@lib/classes/EnvFile";

export default class EnvVariableNotSetError extends Error {
  constructor(envFile: EnvFile, envVar: string, envValue: string) {
    super(`Environment variable in ${envFile} is not set. [${envVar}=${envValue}]`);
  }
}