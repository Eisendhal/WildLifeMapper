<?php

include('db.php');

$lgt = $_POST['longitude'];
$lat = $_POST['latitude'];
$animal = $_POST['animal'];
$pseudo = $_POST['pseudo'];
$details = $_POST['details'];

if($animal == "Autre") {
	$animal = null;
}
if(empty($pseudo)) {
	$pseudo = null;
}
if(empty($details)) {
	$details = null;
}

//Handle the image
$fileName = $_FILES["image"]["tmp_name"];
$imageURL = null;
if(!empty($fileName)) {
	$imageURL = "../img/users/" . basename($fileName);

	if(!move_uploaded_file($fileName, $imageURL)) {
		http_response_code(415);
	}
}

$query = "
	INSERT INTO PointWildlife
	(dateTime, coords, animal, pseudo, customImageURL, details)
	VALUES(NOW(), GeomFromText(?), ?, ?, ?, ?)";

$statement = $db->stmt_init();

if(!$statement->prepare($query)) {
	trigger_error($statement->error, E_USER_ERROR);
}

$pointSQL = "POINT(" . (float)$lgt . " " . (float)$lat . ")";

//TODO: REMOVE
var_dump($pointSQL);
var_dump($lgt);
var_dump($lat);
var_dump($animal);
var_dump($pseudo);
var_dump($imageURL);
var_dump($details);

if(!$statement->bind_param("sssss", $pointSQL, $animal, $pseudo,
	                       $imageURL, $details)) {
	trigger_error($statement->error, E_USER_ERROR);
}

if(!$statement->execute()) {
	trigger_error($statement->error, E_USER_ERROR);
}

?>
