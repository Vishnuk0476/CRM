const ftp = require("basic-ftp");

async function fixApi() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "eyewebsolution.dnshostserver.in",
            user: "panyaglobalmoews",
            password: "ParT@A&&$J(Ma",
            secure: false
        });

        await client.cd('/public_html/api');
        await client.uploadFrom("import_db.php", "import_db.php");
        
        try {
            await client.remove(".htaccess");
            console.log("Removed .htaccess");
        } catch(e) {
            console.log("No .htaccess to remove");
        }
        
    }
    catch(err) {
        console.error(err);
    }
    client.close();
}
fixApi();
