/* ========================================================
 * Mike Emory maps related java script methods
 * ======================================================== */

var geocoder;
var map;
var heatmap, fusionmap, transitLayer, bartLayer;
var markers = [];

function initialize() {

	var styles = [
	  {
	    "featureType": "landscape.man_made",
	    "elementType": "geometry",
	    "stylers": [
	      { "weight": 0.1 },
	      { "color": "#808080" },
	      { "lightness": 55 }
	    ]
	  },{
	    "featureType": "road.arterial",
	    "elementType": "geometry",
	    "stylers": [
	      { "color": "#808080" },
	      { "lightness": 100 },
	      { "weight": 0.5 }
	    ]
	  },{
	    "featureType": "road.arterial",
	    "elementType": "labels.text.stroke",
	    "stylers": [
	      { "color": "#808080" },
	      { "lightness": 100 }
	    ]
	  },{
	    "featureType": "road.highway",
	    "elementType": "geometry.fill",
	    "stylers": [
	      { "color": "#808080" },
	      { "weight": 1.5 }
	    ]
	  },{
	    "featureType": "road.highway",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      { "color": "#808080" },
	      { "lightness": 50 },
	      { "weight": 0.5 }
	    ]
	  },{
	    "featureType": "road.highway",
	    "elementType": "labels.text.stroke",
	    "stylers": [
	      { "color": "#808080" },
	      { "weight": 4 }
	    ]
	  },{
	    "featureType": "road.highway",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      { "color": "#808080" },
	      { "lightness": 100 }
	    ]
	  },{
	    "featureType": "water",
	    "elementType": "geometry.fill",
	    "stylers": [
	      { "hue": "#00fff7" },
	      { "lightness": 40 }
	    ]
	  },{
	    "featureType": "poi.park",
	    "elementType": "geometry.fill",
	    "stylers": [
	      { "hue": "#00ff19" },
	      { "lightness": -10 }
	    ]
	  },{
	  }
	];

	var styledMap = new google.maps.StyledMapType(styles, {name: "Memory"});

	geocoder = new google.maps.Geocoder();

	var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);

	var mapOptions = {
	  center: sanFrancisco,
	  zoom: 11,
	  mapTypeControlStyle: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
	  streetViewControl: false,
	  panControl: false,
	  mapTypeControlOptions: {
	  	mapTypeIds: [google.maps.MapTypeId.HYBRID, 'mike_style']
	  },
	};

	map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

	//Associate the styled map with the MapTypeId and set it to display.
	map.mapTypes.set('mike_style', styledMap);
	map.setMapTypeId('mike_style');

	transitLayer = new google.maps.TransitLayer();

	// Faux heatmap data
	var heatMapData = [
	  {location: new google.maps.LatLng(37.765062,-122.419694), weight: 1},
	  {location: new google.maps.LatLng(37.752254,-122.418466), weight: 1.15},
	  {location: new google.maps.LatLng(37.779528,-122.413756), weight: 0.8},
	  {location: new google.maps.LatLng(37.792976,-122.396742), weight: 1},
	  {location: new google.maps.LatLng(37.789256,-122.401407), weight: 0.6},
	];

	heatmap = new google.maps.visualization.HeatmapLayer({
	  data: heatMapData,
	  radius: 20,
	  opacity: 0.5,
	});

	// Read data from google fusion table
	fusionmap = new google.maps.FusionTablesLayer({
	  query: {
	    select: 'Location',
	    from: '1nO9A5voqTI0uhRbveKUr3xW2n8_gc1B5M9njLqY',
	  },
	  heatmap: {
	    enabled: false
	  },
	  suppressInfoWindows: false,
	});

	// Read data from hosted mkl file
	bartLayer = new google.maps.KmlLayer('http://www.stanford.edu/~memory/site/maps_test/kml/mike_gen.kml', {preserveViewport: true});

	drawMarkers_request();
}

function toggleHeatmap() {
	heatmap.setMap(heatmap.getMap() ? null : map);
}

function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}

function toggleBart() {
	bartLayer.setMap(bartLayer.getMap() ? null : map);
}

function toggleFusion() {
	fusionmap.setMap(fusionmap.getMap() ? null : map);
}

function codeAddress() {
	var address = document.getElementById("address").value;
	geocoder.geocode( { 'address': address}, function(results,status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
		}
		else {
			alert("Geocode was not successful: " + status);
		}
	});
}




function drawMarkers_request() {

  google.load('visualization', '1.0', {'packages':['table']});

  // Specify file/database to query
  var dataSourceUrl = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdHdhWU5SZDRzcTEyeS1oVUwzdXdRaHc&headers=-1';
  var opts = {sendMethod: 'xhr'};
  var query = new google.visualization.Query(dataSourceUrl, opts);

  // pull longitude, latitude data
  query.setQuery('select F, G, B');
  
  // Send the query with a callback function.
  query.send(drawMarkers_response);

}

function drawMarkers_response(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();

  for ( var i=0; i<data.getNumberOfRows()-1;i++) {
  	markers.push(new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(data.getValue(i,0),data.getValue(i,1)),
        title: data.getValue(i,2),
    }));

	// markers.push({
	// 	location: new google.maps.LatLng(data.getValue(i,0),data.getValue(i,1)),
	// 	weight: 1,
	// });

	// heatmap = new google.maps.visualization.HeatmapLayer({
	//   data: markers,
	//   radius: 20,
	//   opacity: 0.5,
	// });
  }
}



// Removes the overlays from the map, but keeps them in the array
function clearMarkers() {
  if (markers) {
    for (i in markers) {
      markers[i].setMap(null);
    }
  }
}

// Shows any overlay currently in the array
function showMarkers() {
  if (markers) {
    for (i in markers) {
      markers[i].setMap(map);
    }
  }
}


