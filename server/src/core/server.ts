import express, { NextFunction, Request, Response, Router } from "express";

class Server {
    private app: express.Application;
    private port: number;
    
    constructor(port: number) {
        this.app = express();
        this.port = port;
    }
    
    public start(): void {
        this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
        });
    }
}

export default Server;