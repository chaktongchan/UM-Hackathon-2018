<?php

$error = true;

if(isset($_GET['action'])) {
    $action = $_GET['action'];
    
    if(file_exists("model/{$action}.php")) {
        include_once("model/{$action}.php");
        $error = false;
    }
}

if($error === true) {
    include_once("model/index.php");
}

include_once("view/tojson.php");
