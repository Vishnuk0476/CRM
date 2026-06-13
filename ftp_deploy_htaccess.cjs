const ftp = require("basic-ftp");
const fs = require("fs");

async function deployHtaccess() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "eyewebsolution.dnshostserver.in",
            user: "panyaglobalmoews",
            password: "ParT@A&&$J(Ma",
            secure: false
        });
        await client.cd('/public_html/api');
        await client.uploadFrom("api_deploy/.htaccess", ".htaccess");
        console.log('Done uploading .htaccess!');
    }
    catch(err) {
        console.error(err);
    }
    client.close();
}
deployHtaccess();
