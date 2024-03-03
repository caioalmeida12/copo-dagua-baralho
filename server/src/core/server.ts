import express, { NextFunction, Request, Response, Router } from "express";

import morgan from "morgan";
// import { errorMiddlewares, requestMiddlewares, responseMiddlewares } from "@server/middlewares";
import routes from "@server/routes";
import helmet from "helmet";

import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import path from "path";

type Component = Router | ((error: Error, req: Request, res: Response, next: NextFunction) => Response | undefined);

class Server {
    public app: express.Application;
    public port: number;
    private httpServer;
    private io: SocketIOServer;

    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT);
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer);

        if (process.env.NODE_ENV === "development") this.app.use(morgan("dev"));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(helmet({
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "cdnjs.cloudflare.com", "'unsafe-inline'"],
                // ... other directives
              }
            }
          }));
        this.app.use(express.static(path.join(__dirname, 'public')));

        // this.addComponent(requestMiddlewares);
        this.addComponent(routes);
        // this.addComponent(responseMiddlewares);
        // this.addComponent(errorMiddlewares);

        this.addSocketEvent("connection", (socket: Socket) => {
            console.log(`\x1b[35m${socket.id}\x1b[0m: Conexão estabelecida`);

            socket.on("disconnect", () => {
                console.log(`\x1b[35m${socket.id}\x1b[0m: Conexão encerrada`);
            });
        });

        this.app.use("/health", (req, res) => res.status(200).json({ status: "OK" }));
    }

    start(callback: () => void): void {
        this.httpServer.listen(this.port, callback);
    }
    
    private addComponent(component: Array<Component>): void {
        component.map(component => {
            this.app.use(component)

            if (process.env.NODE_ENV === "development") console.log(`✔ Componente \x1b[35m${component.name || component.toString().replace("() => ", "")}\x1b[0m adicionado ao servidor`);
        });
    }

    private addSocketEvent(event: string, callback: (socket: Socket) => void): void {
        this.io.on(event, callback);
    }
}

export default Server;