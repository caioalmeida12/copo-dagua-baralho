import fs from 'fs';
import path from 'path';

import EnvFile from "@lib/classes/EnvFile"

const filePath = path.resolve(__dirname, "../../../config/env/");

const envFiles = fs.readdirSync(filePath).filter((file) => file.includes('.env'));

const isEveryEnvFileValid = envFiles.every((filePath) => {
    return new EnvFile(filePath).isValid();
});

export default isEveryEnvFileValid;