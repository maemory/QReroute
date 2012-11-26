/* ========================================================
 * Mike Emory maps related java script methods
 * ======================================================== */
google.load('visualization', '1.0', {'packages':['corechart','table']});

var map;
var heatmap, transitLayer, sfmta_fusion;
var markers = [];
var poly,offsetId;


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

	var bus = {
	    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
	    scale: 2,
	    strokeColor: "red"
	};

	var polyOptions = {
	    strokeColor: "blue",
	    strokeOpacity: 1.0,
	    strokeWeight: 2,
	    icons: [{
	    	icon: bus,
	    	offset: '0%',
	    }]
	}

	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);

	//Associate the styled map with the MapTypeId and set it to display.
	map.mapTypes.set('mike_style', styledMap);
	map.setMapTypeId('mike_style');

	transitLayer = new google.maps.TransitLayer();

	// Read shape data from sfmta fusion table
	sfmta_fusion = new google.maps.FusionTablesLayer({
	  query: {
	    select: 'shape_pt_lat',
	    from: '1sYo_Sem6XHqtMKK94bTsOnbE26ymr-Y0Rz39O7A',
	    where: 'shape_id = 92359'
	  },
	  heatmap: {
	    enabled: false
	  },
	  suppressInfoWindows: false,
	});

	// drawMarkers_request();
	drawRoute_request();
	// drawTable_request();

}

function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}

function drawRoute_request() {

  // Specify file/database to query
  // var dataSourceUrl = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdHdhWU5SZDRzcTEyeS1oVUwzdXdRaHc&headers=-1&gid=1';
  var sfmtaData = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdGJYTlRfSGZLVWV5VTJwejZjeGN5NXc&headers=-1&sheet=Shapes'
  var opts = {sendMethod: 'xhr'};
  var query = new google.visualization.Query(sfmtaData, opts);

  // pull longitude, latitude data
  query.setQuery('select C,B,D,A where A=92359 order by D');
  
  // Send the query with a callback function.
  query.send(drawRoute_response);

}

function drawRoute_response(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }
  var data = response.getDataTable();

  var path = poly.getPath();

  for ( var i = 0; i < data.getNumberOfRows()-1; i++) {
  	var mark_loc = new google.maps.LatLng(data.getValue(i,0),data.getValue(i,1));

  	path.push(mark_loc);
  }

}

function drawMarkers_request() {

  // Specify file/database to query
  // var dataSourceUrl = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdHdhWU5SZDRzcTEyeS1oVUwzdXdRaHc&headers=-1&gid=1';
  var sfmtaData = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdGJYTlRfSGZLVWV5VTJwejZjeGN5NXc&headers=-1&sheet=Stops'
  var opts = {sendMethod: 'xhr'};
  var query = new google.visualization.Query(sfmtaData, opts);

  // pull longitude, latitude data
  query.setQuery('select D,E,B,A order by A');
  
  // Send the query with a callback function.
  query.send(drawMarker_response);

}

function drawMarker_response(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }
  var data = response.getDataTable();

  var path = poly.getPath();

  // Draw Markers
  for ( var i = 0; i < data.getNumberOfRows()-1; i++) {
  	var mark_loc = new google.maps.LatLng(data.getValue(i,0),data.getValue(i,1));

  	markers.push(new google.maps.Marker({
        map: map,
        position: mark_loc,
        title: data.getValue(i,2),
        icon: {
		    path: google.maps.SymbolPath.CIRCLE,
		    scale: 3,
			fillColor: "blue",
			fillOpacity: 0.4,
			strokeColor: "gold",
			strokeWeight: 2,
		}
    }));

  	// Draw polyline
    // path.push(mark_loc);

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

function animateBus() {
	var count = 0;
    offsetId = window.setInterval(function() {
      count = (count + 1);

      var icons = poly.get('icons');
      icons[0].offset = (count / 2) + '%';
      poly.set('icons', icons);

      if (count == 200) {
      	offsetId = window.clearInterval(offsetId);
      }
  }, 50);
}



function drawTable_request() {

  // Specify file/database to query
  // var dataSourceUrl = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdHdhWU5SZDRzcTEyeS1oVUwzdXdRaHc&headers=-1&gid=1';
  var sfmtaData = 'https://docs.google.com/spreadsheet/tq?key=0AmyNuspmRZ6tdGJYTlRfSGZLVWV5VTJwejZjeGN5NXc&headers=-1&sheet=Stops'
  var opts = {sendMethod: 'xhr'};
  var query = new google.visualization.Query(sfmtaData, opts);

  // pull longitude, latitude data
  query.setQuery('select D,E,B,A order by A');
  
  // Send the query with a callback function.
  query.send(drawTable_response);

}

function drawTable_response(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();
  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, {width: '100%', height: 300});
}

function toggleFusion() {
	sfmta_fusion.setMap(sfmta_fusion.getMap() ? null : map);
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



