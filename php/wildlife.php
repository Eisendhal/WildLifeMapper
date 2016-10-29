<?php

header('Content-Type: application/json; charset=utf-8');
include('db.php');

/*$w = $_GET['nw']['longitude'];
$e = $_GET['se']['longitude'];
$n = $_GET['nw']['latitude'];
$s = $_GET['se']['latitude'];*/

$query = '
	SELECT *
	FROM viewPointWildlife';
/*  WHERE (longitude BETWEEN ? AND ?)
 *  AND (latitude BETWEEN ? AND ?)'
 *  -> Does not work when map is rotated, or panned' */


$statement = $db->stmt_init();

if(!$statement->prepare($query)) {
	trigger_error($statement->error, E_USER_ERROR);
}

/* No need to bind param, the query has been cut
if(!$statement->bind_param('dddd', $w, $e, $s, $n)) {
	trigger_error($statement->error, E_USER_ERROR);
}*/

if(!$statement->execute()) {
	trigger_error($statement->error, E_USER_ERROR);
}

$results = $statement->get_result();
if(!$results) {
	trigger_error($statement->error, E_USER_ERROR);
}

$objects = array();
while($row = $results->fetch_assoc()) {
	$objects[] = $row;
}

$json = json_encode($objects);
if(!$json) {
	trigger_error(json_last_error_msg(), E_USER_ERROR);
}

echo($json);

$results->free();

?>
