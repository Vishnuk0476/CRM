const ftp = require("basic-ftp");

async function executeImport() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "eyewebsolution.dnshostserver.in",
            user: "panyaglobalmoews",
            password: "ParT@A&&$J(Ma",
            secure: false
        });

        console.log("Renaming .htaccess...");
        try {
            await client.rename('/public_html/.htaccess', '/public_html/.htaccess.bak');
        } catch(e) {
            console.log("No .htaccess found or rename failed:", e.message);
        }

        console.log("Waiting a bit...");
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Done! Run curl now!");

    }
    catch(err) {
        console.error(err);
    }
    client.close();
}

executeImport();
