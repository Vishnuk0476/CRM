<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = mysqli_connect('localhost', 'panyaglobalmoews_crmusr', 'Vishnu#2026!DB', 'panyaglobalmoews_crmdb');
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = file_get_contents('infinityfree_dump_final.sql');
if (!$sql) {
    die("Error reading SQL file");
}

if(mysqli_multi_query($conn, $sql)) {
    echo "SUCCESS_IMPORT";
} else {
    echo "ERROR_IMPORT: " . mysqli_error($conn);
}
mysqli_close($conn);
