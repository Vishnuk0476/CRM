const ftp = require("basic-ftp");
const fs = require("fs");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log('Connecting to cPanel FTP...');
        await client.access({
            host: "eyewebsolution.dnshostserver.in",
            user: "panyaglobalmoews",
            password: "ParT@A&&$J(Ma",
            secure: false
        });

        console.log('Connected! Creating .env for cPanel...');
        // Create custom .env for cPanel
        let envContent = fs.readFileSync('public_html/api/.env', 'utf8');
        envContent = envContent.replace(/DB_HOST=.*/g, 'DB_HOST=localhost');
        envContent = envContent.replace(/DB_NAME=.*/g, 'DB_NAME=panyaglobalmoews_crmdb');
        envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=panyaglobalmoews_crmusr');
        envContent = envContent.replace(/DB_PASS=.*/g, 'DB_PASS=Vishnu#2026!DB');
        fs.writeFileSync('api_deploy/.env', envContent);

        console.log('Uploading API folder...');
        await client.ensureDir("public_html/api");
        await client.uploadFromDir("api_deploy");

        console.log('Uploading Database File...');
        await client.cd('/public_html/api');
        await client.uploadFrom("infinityfree_dump_final.sql", "infinityfree_dump_final.sql");
        
        console.log('Uploading Import Script...');
        await client.uploadFrom("import_db.php", "import_db.php");

        console.log('Done!');
    }
    catch(err) {
        console.error(err);
    }
    client.close();
}

deploy();
