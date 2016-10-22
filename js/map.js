function WildlifeMap() {
	// DEFINE ATTRIBUTES
	this.wildlifeMarkersList = [];

	// INSTANCIATE MAPBOX
	// Our default MapBox's accessToken
	mapboxgl.accessToken = 'pk.eyJ1IjoidnRlcnRvaXMiLCJhIjoiY2l1OXYyYWQ4MDAwNDJvbDc3YXNvMzhnOCJ9.gUf56M93BErFAYA19YoH0g';
	this.map = new mapboxgl.Map({
		container: 'map', // Container id
		style: 'mapbox://styles/mapbox/outdoors-v9', // Map style (here, for pedestrian)
		center: [-71.05, 48.4159], // Default position
		zoom: 12 // Default zoom
	});
	this.map.addControl(new mapboxgl.NavigationControl());

	// DEFINE ASYNC FUNCTIONS CALLS
	// Fetch the wildlife points every 30 secs
	setInterval($.proxy(this.fetchWildlife, this), 30000);
	// Execute the function directly otherwise a 30sec wait is required
	this.fetchWildlife();
}

WildlifeMap.prototype.fetchWildlife = function() {
	$.getJSON("php/wildlife.php", $.proxy(function(geoJSON) {
		//Remove each marker before updating
		this.clearWildlifePoints();

		geoJSON.features.forEach($.proxy(function(pointInfos) {
			this.createWildlifePoint(pointInfos);
		}, this));
	}, this));
}

WildlifeMap.prototype.clearWildlifePoints = function() {
	this.wildlifeMarkersList.forEach(function(marker) {
		marker.remove();
	});
	this.wildlifeMarkersList = [];
}

WildlifeMap.prototype.createWildlifePoint = function(pointInfos) {
	var el = document.createElement('div');
	el.className = 'marker';
	el.style.backgroundImage = 'url(' + pointInfos.properties.image + ')'; 
	el.addEventListener('click', $.proxy(function() {
		this.clickOnWildlifePoint(pointInfos);
	}, this));

	var wildlifeMarker = new mapboxgl.Marker(el);
	wildlifeMarker.setLngLat(pointInfos.geometry.coordinates);
	wildlifeMarker.addTo(this.map);
	this.wildlifeMarkersList.push(wildlifeMarker);
}

WildlifeMap.prototype.clickOnWildlifePoint = function(pointInfos) {
	$('#modalAnimal').get(0).innerHTML = pointInfos.properties.animal;
	$('#modalPseudo').get(0).innerHTML = pointInfos.properties.pseudo;
	$('#modalImage').get(0).src = pointInfos.properties.image;
	$('#modalDate').get(0).innerHTML = pointInfos.properties.datetime;
	$('#modalDetails').get(0).innerHTML = pointInfos.properties.details;
	$('#smallModal').modal();
}
