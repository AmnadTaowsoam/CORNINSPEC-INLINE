const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function getDbConfig(prefix) {
    const keys = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
    const envVars = keys.map(key => `${prefix}_${key}`);
    const config = {};

    const missingVars = envVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error(`Missing environment variables: ${missingVars.join(', ')} for the ${prefix} database.`);
        throw new Error(`Database configuration error: Missing environment variables [${missingVars.join(', ')}] for the ${prefix} database.`);
    }

    config.host = process.env[`${prefix}_DB_HOST`];
    config.user = process.env[`${prefix}_DB_USERNAME`];
    config.password = process.env[`${prefix}_DB_PASSWORD`];
    config.database = process.env[`${prefix}_DB_NAME`];
    config.port = parseInt(process.env[`${prefix}_DB_PORT`], 10);

    return config;
}

const usersPool = new Pool(getDbConfig('USERS'));

module.exports = { usersPool };
