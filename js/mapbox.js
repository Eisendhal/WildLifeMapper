// JQuery bootstrap
$(function() {
	startMapBox();
	setInterval(fetchWildlife, 30000); //Fetch the wildlife every 30 seconds
	fetchWildlife();
});

var map;
var markers = [];

function startMapBox() {
	// Our default MapBox's accessToken
	mapboxgl.accessToken = 'pk.eyJ1IjoidnRlcnRvaXMiLCJhIjoiY2l1OXYyYWQ4MDAwNDJvbDc3YXNvMzhnOCJ9.gUf56M93BErFAYA19YoH0g';
	map = new mapboxgl.Map({
		container: 'map', // Container id
		style: 'mapbox://styles/mapbox/outdoors-v9', // Map style (here, for pedestrian)
		center: [-71.05, 48.4159], // Default position
		zoom: 12 // Default zoom
	});
	map.addControl(new mapboxgl.NavigationControl());
}

function fetchWildlife() {
	$.getJSON("php/wildlife.php", function(geoJSON) {
		//Remove each marker before updating
		markers.forEach(function(marker) {
			marker.remove();
		});
		markers = [];

		geoJSON.features.forEach(function(point) {
			var el = document.createElement('div');
			el.className = 'marker';
			el.style.backgroundImage = 'url(' + point.properties.image + ')'; 
			el.addEventListener('click', function() {
				//Marche pas car point non existant
        		$('#modalAnimal').get(0).innerHTML = point.properties.animal;
				$('#modalPseudo').get(0).innerHTML = point.properties.pseudo;
				$('#modalImage').get(0).src = point.properties.image;
				$('#modalDate').get(0).innerHTML = point.properties.datetime;
				$('#modalDetails').get(0).innerHTML = point.properties.details;
				$('#smallModal').modal();
    		});

			var marker = new mapboxgl.Marker(el);
			marker.setLngLat(point.geometry.coordinates);
			marker.addTo(map);
			markers.push(marker);
		});
	});
}
