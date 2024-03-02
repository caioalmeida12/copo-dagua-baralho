import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import EnvVariableNotSetError from '@lib/errors/EnvVariableNotSetError';

export default class EnvFile {
    public content: string;
    public name: string;

    constructor(name: string) {
        this.name = name;
        this.content = fs.readFileSync(path.resolve("../config/env", name), 'utf-8');
    }

    public parse(): dotenv.DotenvParseOutput{
        return dotenv.parse(this.content);
    }

    public isValid(): void {
        const parsed = this.parse();
        const keys = Object.keys(parsed);

        keys.forEach((key) => {
            if ([undefined, null, ''].includes(parsed[key])) {
                throw new EnvVariableNotSetError(this, key, parsed[key]);
            }
        });
    }
}