import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import EnvVariableNotSetError from '@lib/errors/EnvVariableNotSetError';

const dotenvPath = path.resolve("config/env/.env");

dotenv.config({ path: dotenvPath })

export default class EnvFile {
    public content: string;
    public path: string;

    constructor(name: string) {
        this.path = name;
        this.content = fs.readFileSync(dotenvPath, 'utf-8');
    }

    public parse(): dotenv.DotenvParseOutput {
        return dotenv.parse(this.content);
    }

    public isValid(): void {
        const parsed = this.parse();
        const keys = Object.keys(parsed);

        keys.forEach((key) => {
            if (['undefined', 'null', ''].includes(parsed[key])) {
                throw new EnvVariableNotSetError(this, key, parsed[key]);
            }

            console.log(`✅ [EnvFile]: ${key} = ${parsed[key]}`);
        });
    }
}