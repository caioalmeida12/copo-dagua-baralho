import core from "./core";

// this is the entry point of the server
// we start the server by calling the start method of the core

core.server.start(() => {
    console.log(`\x1b[33mServer is running on http://localhost:${process.env.PORT} 🚀\x1b[0m`)
}); 