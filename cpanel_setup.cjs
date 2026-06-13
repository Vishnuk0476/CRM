const https = require('https');

const username = 'panyaglobalmoews';
const password = 'ParT@A&&$J(Ma';
const host = 'eyewebsolution.dnshostserver.in';
const port = 2083;

const auth = Buffer.from(`${username}:${password}`).toString('base64');

function callCpanelAPI(module, func, params = {}) {
    return new Promise((resolve, reject) => {
        const queryParams = new URLSearchParams(params).toString();
        const path = `/execute/${module}/${func}${queryParams ? '?' + queryParams : ''}`;
        
        const options = {
            hostname: host,
            port: port,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            },
            rejectUnauthorized: false // Ignore SSL certificate issues if any
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function setupDatabase() {
    try {
        console.log('1. Creating database...');
        const dbName = `${username}_crmdb`;
        let dbRes = await callCpanelAPI('Mysql', 'create_database', { name: dbName });
        console.log(dbRes.errors ? `Error: ${dbRes.errors}` : `Created DB: ${dbName}`);

        console.log('2. Creating database user...');
        const dbUser = `${username}_crmusr`;
        const dbPass = 'Vishnu#2026!DB';
        let userRes = await callCpanelAPI('Mysql', 'create_user', { name: dbUser, password: dbPass });
        console.log(userRes.errors ? `Error: ${userRes.errors}` : `Created User: ${dbUser}`);

        console.log('3. Granting privileges...');
        let privRes = await callCpanelAPI('Mysql', 'set_privileges_on_database', {
            user: dbUser,
            database: dbName,
            privileges: 'ALL PRIVILEGES'
        });
        console.log(privRes.errors ? `Error: ${privRes.errors}` : `Granted privileges!`);
        
        console.log(`\nSUCCESS! Database Credentials:`);
        console.log(`DB_NAME: ${dbName}`);
        console.log(`DB_USER: ${dbUser}`);
        console.log(`DB_PASS: ${dbPass}`);

    } catch (e) {
        console.error('API Error:', e.message);
    }
}

setupDatabase();
