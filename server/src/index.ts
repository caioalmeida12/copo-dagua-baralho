import path from "path";
import Server from "./core/server";

import dotenv from "dotenv";

try {
    dotenv.config({
        path: path.resolve(__dirname, `../../../config`),
    });
    
    const instance = new Server(Number(process.env.PORT) || 5000);

    instance.start();
} catch (error) {
    console.error(error);
}
