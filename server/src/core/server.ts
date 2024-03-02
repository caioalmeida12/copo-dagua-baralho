import express from 'express';

class Server {
    private app: express.Application;
    private port: number;
    
    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;
    }
    
    public start(): void {
        this.app.listen(this.port, () => {
        console.log(`Server started on port ${this.port}`);
        });
    }
}

export default Server;