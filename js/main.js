function WildlifeMap() {
	// DEFINE ATTRIBUTES
	this.wildlifeMarkersList = [];
	this.map = {} 
	this.isAppear = false;
	this.isDragging = false;
	this.isCursorOverPoint = false;
	
	// INSTANCIATE MAPBOX
	// Our default MapBox's accessToken
	mapboxgl.accessToken = 'pk.eyJ1IjoidnRlcnRvaXMiLCJhIjoiY2l1OXYyYWQ4MDAwNDJvbDc3YXNvMzhnOCJ9.gUf56M93BErFAYA19YoH0g';

	this.map = new mapboxgl.Map({
		container: 'map', // Container id
		// Map style (here, for pedestrian)
		style: 'mapbox://styles/mapbox/outdoors-v9', 		
		center: [-71.05, 48.4159], // Default position
		zoom: 12 // Default zoom
	});
	this.canvas = this.map.getCanvasContainer();
	this.geojson = {
		"type": "FeatureCollection",
		"features": [{
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [null, null]
			}
		}]
	};
	
	// Display zoom, compass
	this.map.addControl(new mapboxgl.NavigationControl());

	// Data of the geoloc circle
	this.geolocData = {
		'type': 'FeatureCollection',
		'features': [{
			'type': 'Feature',
			'geometry': {
				'type': 'Point',
				'coordinates': [0, 0]
			}
		}]
	};

	this.map.on('load', $.proxy(function() {
		this.map.addSource('geolocSrc', {
			'type': 'geojson',
			'data': this.geolocData
		});

		// To draw the geoloc circle
		this.map.addLayer({
			'id': 'geolocLayer',
			'type': 'circle',
			'source': 'geolocSrc',
			'layout': {
				'visibility': 'none'
			},
			'paint': {
				'circle-radius': 0,
				'circle-color': '#5b94c6',
				'circle-opacity': 0.6
			}
		});
	}, this));

	// Display Geolocate Button
	var geolocate = new mapboxgl.GeolocateControl({position: 'bottom-right'});
	geolocate.on('geolocate', $.proxy(this.geolocate, this));
	// Display Geolocate Button
	this.map.addControl(geolocate);    

	// DEFINE ASYNC FUNCTIONS CALLS
	this.map.on('mousedown', $.proxy(this.mouseDown, this), true);
	this.map.on('mousemove', $.proxy(this.onMouseMove, this));
	this.map.on('click', $.proxy(this.displayForm,this));
	
	// Fetch the wildlife points every 30 secs
	setInterval($.proxy(this.fetchWildlife, this), 30000);
	// Execute fetchWildlife when the map move (translation, zoom, ...)
	this.map.on('moveend', $.proxy(this.fetchWildlife, this));

	// Execute the function directly otherwise a 30sec wait is required
	this.fetchWildlife();
}

WildlifeMap.prototype.geolocate = function(e) {
	// Change the coords
	this.geolocData.features[0].geometry.coordinates =
		[e.coords.longitude, e.coords.latitude];
	this.map.getSource('geolocSrc').setData(this.geolocData);

	// Display the circle
	var circleRadius = this.getMetersToPixelsAtMaxZoom(
		e.coords.accuracy / 2, e.coords.latitude);
	this.map.setPaintProperty('geolocLayer', 'circle-radius', {
		stops: [
			[0, 0],
			[20, circleRadius]
		],
		base: 2
	});
	this.map.setLayoutProperty('geolocLayer', 'visibility', 'visible');
}

// Inspired from http://stackoverflow.com/a/37794326/5153648
WildlifeMap.prototype.getMetersToPixelsAtMaxZoom = function(meters, latitude) {
	return meters / 0.075 / Math.cos(latitude * Math.PI / 180);
}

/*WildlifeMap.prototype.getBounds = function() {
	//Should be executed just one time
	if(this._sendableBounds == null) {
		this._sendableBounds = {
			'nw': {
				'latitude': null,
				'longitude': null
			},
			'se': {
				'latitude': null,
				'longitude': null
			}
		};
	}

	var bounds = this.map.getBounds();
	this._sendableBounds.nw.latitude = bounds.getNorth();
	this._sendableBounds.nw.longitude = bounds.getWest();
	this._sendableBounds.se.latitude = bounds.getSouth();
	this._sendableBounds.se.longitude = bounds.getEast();

	return this._sendableBounds;
}*/

WildlifeMap.prototype.fetchWildlife = function() {
	//TODO: Do not refresh everything
	//TODO: Compute time passed since each insertion
	// Sent the current bounds cause we don't need to display invisible points
	$.getJSON('php/wildlife.php', /*this.getBounds(),*/ $.proxy(function(jsonData) {
		//Remove each marker before updating
		this.clearWildlifePoints();

		jsonData.forEach($.proxy(function(pointInfos) {
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
	if(pointInfos.image != null) {
		el.style.backgroundImage = 'url(' + pointInfos.image + ')'; 
	}
	el.addEventListener('click', $.proxy(function() {
		this.clickOnWildlifePoint(pointInfos);
	}, this));

	var wildlifeMarker = new mapboxgl.Marker(el);
	wildlifeMarker.setLngLat([
		pointInfos.longitude,
		pointInfos.latitude]);
	wildlifeMarker.addTo(this.map);
	this.wildlifeMarkersList.push(wildlifeMarker);
}

WildlifeMap.prototype.clickOnWildlifePoint = function(pointInfos) {
	var modalIsAnimal = $('#modalIsAnimal').get(0);
	if(pointInfos.animal == null) {
		modalIsAnimal.style.display = 'none';
	} else {
		modalIsAnimal.style.display = '';
		$('#modalAnimal').get(0).innerHTML = pointInfos.animal;
	}

	var modalIsImage = $('#modalImage').get(0);
	if(pointInfos.image == null) {
		modalImage.style.display = 'none';
	} else {
		modalImage.style.display = '';
		modalImage.src = pointInfos.image;
	}

	var modalIsDescription = $('#modalIsDescription').get(0);
	if(pointInfos.description == null) {
		modalIsDescription.style.display = 'none';
	} else {
		modalIsDescription.style.display = '';
		$('#modalDescription').get(0).innerHTML = pointInfos.description;
	}

	var modalIsPseudo = $('#modalIsPseudo').get(0);
	if(pointInfos.pseudo == null) {
		modalIsPseudo.style.display = 'none';
	} else {
		modalIsPseudo.style.display = '';
		$('#modalPseudo').get(0).innerHTML = pointInfos.pseudo;
	}

	var modalIsDetails = $('#modalIsDetails').get(0);
	if(pointInfos.details == null) {
		modalIsDetails.style.display = 'none';
	} else {
		modalIsDetails.style.display = '';
		$('#modalDetails').get(0).innerHTML = pointInfos.details;
	}

	$('#modalMinutes').get(0).innerHTML = pointInfos.minutes;

	$('#smallModal').modal();
}

WildlifeMap.prototype.createPoint = function (e) {
	var position = e.lngLat;
	var lgt = position.lng;
	var lat = position.lat;	

	this.geojson.features[0].geometry.coordinates = [lgt, lat];

	// Add a single point to the map
	this.map.addSource('point', {
		"type": "geojson",
		"data": this.geojson
	});

	this.map.addLayer({
		"id": 'point',
		"type": "circle",
		"source": "point",
		"paint": {
			"circle-radius": 10,
			"circle-color": "#3887be"
		}
	});

	this.isAppear = true
}

WildlifeMap.prototype.mouseDown = function (e) {
	if (!this.isAppear){this.createPoint(e);}
	
	if (!this.isCursorOverPoint) return;

	this.isDragging = true;

	// Set a cursor indicator
	this.canvas.style.cursor = 'grab';

	// Mouse events
	this.map.on('mousemove', $.proxy(this.onMove,this));
	this.map.on('mouseup', $.proxy(this.onUp,this));
}

WildlifeMap.prototype.onMove = function(e) {
	if (!this.isDragging) return;
	var coords = e.lngLat;

	// Set a UI indicator for dragging.
	this.canvas.style.cursor = 'grabbing';

	// Update the Point feature in `geojson` coordinates
	// and call setData to the source layer `point` on it.
	this.geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
	this.map.getSource('point').setData(this.geojson);
}

WildlifeMap.prototype.onUp = function(e) {
	if(!this.isAppear){
		this.createPoint(e);
	}
	var coords = e.lngLat;

	this.canvas.style.cursor = '';
	this.isDragging = false;
}

WildlifeMap.prototype.onMouseMove = function(e) {
	if(!this.isAppear){return;}

	var features = this.map.queryRenderedFeatures(e.point, { layers: ['point'] });

	// Change point and cursor style as a UI indicator
	// and set a flag to enable other mouse events.
	if (features.length) {
		this.map.setPaintProperty('point', 'circle-color', '#3bb2d0');
		this.canvas.style.cursor = 'move';
		this.isCursorOverPoint = true;
		this.map.dragPan.disable();
	} else {
		this.map.setPaintProperty('point', 'circle-color', '#3887be');
		this.canvas.style.cursor = '';
		this.isCursorOverPoint = false;
		this.map.dragPan.enable();
	}
}

WildlifeMap.prototype.displayForm = function(){
	if (this.isCursorOverPoint) {
		$('#InsertForm').modal();
	}
}

WildlifeMap.prototype.reset = function() {
	this.isCursorOverPoint = false;
	this.isDragging = false;
	this.isAppear = false;
	this.geojson.features[0].geometry.coordinates = [null,null];
	this.map.removeLayer('point');
	this.map.removeSource('point');
}

WildlifeMap.prototype.getCursorCoords = function() {
	arrayCoords = this.geojson.features[0].geometry.coordinates;
	objCoords = {
		'longitude': arrayCoords[0],
		'latitude': arrayCoords[1]
	}
	return objCoords;
}

// Enable caching
$.ajaxSetup({
	cache: true
});

// THE MAP
var map = new WildlifeMap();

// THE SIDEBAR
$('#sidebar-btn').click(function() {
	$('#sidebar').toggleClass('visible');
});

// THE FORM
$('#insertAnimalForm').submit(function() {
	// "this" is the form
	var formData = new FormData(this);
	var coords = map.getCursorCoords();
	formData.append('longitude', coords.longitude);
	formData.append('latitude', coords.latitude);
	$.ajax({
		url: 'php/insert.php',
		data: formData,
		processData: false,
		contentType: false,
		type: 'POST',
		success : function() {
			$('#insertForm').modal('hide');
			map.reset();
			map.fetchWildlife();
	}});

	// Return false to prevent page from refreshing
	return false;
});
