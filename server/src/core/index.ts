import isEveryEnvFileValid from "./IsEveryEnvFileValid";
import Server from "./server";

// this file will validate the env files and create a new server instance
// the server instance will start the server in ../index.ts

const core = {
    isEveryEnvFileValid,
    server: new Server()
}

export default core;