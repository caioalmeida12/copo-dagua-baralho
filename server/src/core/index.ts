import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import EnvFile from ""

const envFiles = fs.readdirSync(path.resolve("../config/env")).filter((file) => file.includes('.env'));

const isEveryEnvFileValid = envFiles.every((file) => {
    return new EnvFile(file).isValid();
});

console.log(isEveryEnvFileValid);