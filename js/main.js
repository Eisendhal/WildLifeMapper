function WildlifeMap() {
	// DEFINE ATTRIBUTES
	this.wildlifeMarkersList = [];
	this.map = {} 

	// INSTANCIATE MAPBOX
	// Our default MapBox's accessToken
	mapboxgl.accessToken = 'pk.eyJ1IjoidnRlcnRvaXMiLCJhIjoiY2l1OXYyYWQ4MDAwNDJvbDc3YXNvMzhnOCJ9.gUf56M93BErFAYA19YoH0g';
	this.map = new mapboxgl.Map({
		container: 'map', // Container id
		style: 'mapbox://styles/mapbox/outdoors-v9', // Map style (here, for pedestrian)
		center: [-71.05, 48.4159], // Default position
		zoom: 12 // Default zoom
	});
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
    
	// Display Geolocate Button
    
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
	// Fetch the wildlife points every 30 secs
	setInterval($.proxy(this.fetchWildlife, this), 30000);
	// Execute fetchWildlife when the map move (translation, zoom, ...)
	this.map.on('moveend', $.proxy(this.fetchWildlife, this));

	// Execute the function directly otherwise a 30sec wait is required
	this.fetchWildlife();
}

WildlifeMap.prototype.geolocate = function(e) {
   console.log(e.coords.accuracy);
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

WildlifeMap.prototype.getBounds = function() {
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
}

WildlifeMap.prototype.fetchWildlife = function() {
	//TODO: Do not refresh everything
	//TODO: Compute time passed since each insertion
	// Sent the current bounds cause we don't need to display invisible points
	$.getJSON('php/wildlife.php', this.getBounds(), $.proxy(function(jsonData) {
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
	el.style.backgroundImage = 'url(' + pointInfos.image + ')'; 
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
	$('#modalAnimal').get(0).innerHTML = pointInfos.animal;
	$('#modalPseudo').get(0).innerHTML = pointInfos.pseudo;
	$('#modalImage').get(0).src = pointInfos.image;
	$('#modalMinutes').get(0).innerHTML = pointInfos.minutes;
	$('#modalDescription').get(0).innerHTML = pointInfos.description;
	$('#modalDetails').get(0).innerHTML = pointInfos.details;
	$('#smallModal').modal();
}

var map = new WildlifeMap();

// THE SIDEBAR
$('#sidebar-btn').click(function() {
	$('#sidebar').toggleClass('visible');
});

