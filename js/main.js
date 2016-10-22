$.getScript('js/map.js');

//Main function
$(function() {
	// THE MAP
	var map = new WildlifeMap();

	// THE SIDEBAR
	$('#sidebar-btn').click(function() {
		$('#sidebar').toggleClass('visible');
	});
});
