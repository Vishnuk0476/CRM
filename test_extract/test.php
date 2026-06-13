<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['id'] = 2; // QT-2026-0002 ID (guessing 2)
// Mock admin session
session_start();
$_SESSION['admin_id'] = 1;
$_SESSION['role'] = 'admin';

require 'c:/xampp/htdocs/panyaglobal-local/public_html/api/crm/quotations/detail.php';
