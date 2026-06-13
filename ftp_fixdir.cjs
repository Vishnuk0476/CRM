const ftp = require("basic-ftp");

async function fixDir() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "eyewebsolution.dnshostserver.in",
            user: "panyaglobalmoews",
            password: "ParT@A&&$J(Ma",
            secure: false
        });

        await client.send("SITE CHMOD 755 /public_html/api");
        console.log("chmod 755 /public_html/api success");
        
    }
    catch(err) {
        console.error(err);
    }
    client.close();
}
fixDir();
