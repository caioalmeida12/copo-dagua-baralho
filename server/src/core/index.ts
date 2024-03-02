import isEveryEnvFileValid from "./envValidator";
import Server from "./server";

// this is the entry point of the server
// it will validate the env files and create a new server instance
// the server instance will start the server in ../index.ts

const core = {
    isEveryEnvFileValid,
    server: new Server()
}

export default core;