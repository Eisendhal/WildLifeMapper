<?php

// Include database options
include('config.php');

$db = new mysqli($DB_HOST, $DB_USER, $DB_PASSWORD, $DB_NAME);

if(!$db->set_charset('utf8')) {
	trigger_error($db->error, E_USER_ERROR);
}

if($db->connect_errno) {
	trigger_error($mysqli->connect_error, E_USER_ERROR);
}

?>
