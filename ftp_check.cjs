const ftp = require("basic-ftp");

async function checkFix() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "eyewebsolution.dnshostserver.in",
            user: "panyaglobalmoews",
            password: "ParT@A&&$J(Ma",
            secure: false
        });

        await client.cd('/public_html/api');
        const list = await client.list();
        for(let item of list) {
            if(item.name === 'import_db.php' || item.name === 'infinityfree_dump_final.sql' || item.name === 'test.php') {
                console.log(item.name, item.permissions);
            }
        }
        
        // Let's try to upload a tiny php file and execute it
        const fs = require('fs');
        fs.writeFileSync('test2.php', '<?php echo "Hello World!"; ?>');
        await client.uploadFrom('test2.php', 'test2.php');
        
        // Wait, FTP doesn't always support CHMOD, but basic-ftp does have client.send("SITE CHMOD 644 filename")
        try {
            await client.send("SITE CHMOD 644 import_db.php");
            console.log("chmod 644 import_db.php success");
        } catch(e) {}
    }
    catch(err) {
        console.error(err);
    }
    client.close();
}
checkFix();
