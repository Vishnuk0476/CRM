<?php
$zip = new ZipArchive();
$filename = __DIR__ . '/api_backup.zip';
if ($zip->open($filename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    exit("Cannot open <$filename>\n");
}

$rootPath = realpath(__DIR__);
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($rootPath),
    RecursiveIteratorIterator::LEAVES_ONLY
);

foreach ($files as $name => $file) {
    if (!$file->isDir()) {
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($rootPath) + 1);
        if ($relativePath !== 'api_backup.zip' && $relativePath !== 'zip_api.php') {
            $zip->addFile($filePath, $relativePath);
        }
    }
}
$zip->close();
echo "SUCCESS";
?>