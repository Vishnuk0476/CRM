const https = require('https');
const mysql = require('mysql2/promise');
const fs = require('fs');

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
            rejectUnauthorized: false
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

async function doImport() {
    try {
        console.log('1. Adding % to Remote MySQL Hosts...');
        let addRes = await callCpanelAPI('Mysql', 'add_host', { host: '%' });
        console.log(addRes.errors ? `Error: ${addRes.errors}` : `Added % to allowed hosts!`);

        console.log('2. Waiting a bit for firewall rules to apply...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('3. Connecting to MySQL remotely...');
        const connection = await mysql.createConnection({
            host: 'eyewebsolution.dnshostserver.in',
            user: 'panyaglobalmoews_crmusr',
            password: 'Vishnu#2026!DB',
            database: 'panyaglobalmoews_crmdb',
            multipleStatements: true
        });
        console.log('Connected to MySQL!');

        console.log('4. Reading SQL dump...');
        const sql = fs.readFileSync('infinityfree_dump_final.sql', 'utf8');

        console.log('5. Executing SQL dump... this might take a moment.');
        await connection.query(sql);
        console.log('SQL Executed Successfully!');

        await connection.end();

        console.log('6. Removing % from Remote MySQL Hosts...');
        let delRes = await callCpanelAPI('Mysql', 'delete_host', { host: '%' });
        console.log(delRes.errors ? `Error: ${delRes.errors}` : `Removed % from allowed hosts!`);

        console.log('ALL DONE!');
    } catch (e) {
        console.error('Import Error:', e);
        
        // Ensure we remove % even on error
        console.log('Attempting to cleanup Remote MySQL Hosts...');
        await callCpanelAPI('Mysql', 'delete_host', { host: '%' });
    }
}

doImport();
