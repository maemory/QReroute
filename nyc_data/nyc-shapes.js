/* ========================================================
 * Mike Emory maps related java script methods
 * ======================================================== */
// google.load('visualization', '1.0', {'packages':['corechart','table']});

var ftidShapes = '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk';
var ftidTrips = '1I_yESx3I_Xet3JEM2l0DWHj76cu_gsx7vw2YYXM';
var ftidStops = '17Y_13i04CsvoEVpm7qgQ4SpxJbl8K9c4u1vyVo0';
var ftidStopTimes = '1WwkY8qCCEcUTJ-bw0-gRhn3KQ6d0cNsZ4-DCnxo';

var map;
var transitLayer,fusion_dat;
var markers = [];
var routes = [];

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

	var newYork = new google.maps.LatLng(40.753357,-73.984375);

	var mapOptions = {
	  center: newYork,
	  zoom: 12,
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

	// populate list of routes
	uniqueServiceId();
}

function uniqueShapes() {
	var query = "SELECT 'shape_id' FROM " + ftidTrips
	     + " GROUP BY 'shape_id'"
	     + " LIMIT 10"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('shape-select');
	    for (var i in rows) {
	      var route = rows[i][0];
	      var routeElement = document.createElement('option');
	      routeElement.innerHTML = route;
	      routeElement.className = 'route-disp';

          ftData.appendChild(routeElement);
	    }
	  }
	});
}

function uniqueTripId() {
	var query = "SELECT 'trip_id' FROM " + ftidStopTimes
	     + " GROUP BY 'trip_id'"
	     + " ORDER BY 'arrival_time'"
	     + " LIMIT 5"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('shape-select');
	    for (var i in rows) {
	      var trip = rows[i][0];
	      var tripElement = document.createElement('option');
	      tripElement.innerHTML = trip;
	      tripElement.className = 'trip-disp';

          ftData.appendChild(tripElement);
	    }
	  }
	});
}

function uniqueServiceId() {
	var query = "SELECT 'service_id' FROM " + ftidTrips
	     + " GROUP BY 'service_id'"
	     + " LIMIT 50"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('shape-select');
	    for (var i in rows) {
	      var trip = rows[i][0];
	      var tripElement = document.createElement('option');
	      tripElement.innerHTML = trip;
	      tripElement.className = 'trip-disp';

          ftData.appendChild(tripElement);
	    }
	  }
	});
}

function getShapeIdFromServiceId() {

	// get input from select statement
	var selectInput = document.getElementById("shape-select");
	var serviceId = selectInput.options[selectInput.selectedIndex].text;

	var query = "SELECT 'shape_id' FROM " + ftidTrips
		+ " WHERE 'service_id'='"+serviceId+"'"
		+ " GROUP BY 'shape_id'"
		+ " ORDER BY 'shape_id'"
	    + " LIMIT 100"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];

	    var count = 1;
	    var ftData = document.getElementById('line-data');

	    // Clear current info
	    $(".shape-disp").remove();

	    for (var i in rows) {
	      var shapeId = rows[i][0];

	      if (shapeId.length > 0) {
		    var shapeElement = document.createElement('p');
		    shapeElement.innerHTML = 'Line #' + count + ': ' + shapeId;
		    shapeElement.className = 'shape-disp';

	        ftData.appendChild(shapeElement);

		    addPolyline(shapeId);
	  	    count++;
  	      }
	    }

	    plotRoutes();
	  }
	});
}

function getShapeIdFromTripId() {
	// get input from select statement
	var selectInput = document.getElementById("shape-select");
	var tripId = selectInput.options[selectInput.selectedIndex].text;

	var query = "SELECT 'shape_id' FROM " + ftidTrips
		+ " WHERE 'trip_id'='"+tripId+"'"
	     + "LIMIT 1"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Reset routes holder
	clearMap();
	routes.clear();

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];
	    for (var i in rows) {
	      var shapeId = rows[i][0];

	      routes=addPolyline(shapeId);

	      setPercentage("loadProgress", 50);
	    }
	  }
	});

	plotRoutes(routes);
}

function addPolyline(shapeId) {

	var polyOptions = {
	    strokeColor: routeColor(shapeId),
	    strokeOpacity: 0.2,
	    strokeWeight: 3,
	}

	var route_line = new google.maps.Polyline(polyOptions);

	var path = route_line.getPath();

	var query = "SELECT 'shape_pt_lat','shape_pt_lon' FROM " + ftidShapes
	    + " WHERE 'shape_id'='"+shapeId+"'"
	    + " ORDER BY 'shape_pt_sequence'"
	    + "LIMIT 5000"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('ft-data');
	    for (var i in rows) {
	      var lat_i = rows[i][0];
	      var long_i = rows[i][1];

	      var next_loc = new google.maps.LatLng(lat_i,long_i);

		  path.push(next_loc);
	    }
	  }
	});

	// specify interactivity of polyline

	google.maps.event.addListener(route_line, 'mouseover', function(event) {
     route_line.setOptions({
       strokeOpacity: 1,
       strokeWeight: 4
     });
    });

	google.maps.event.addListener(route_line, 'click',  function(event) {
		// displayShapeInfo(shapeId);
		var routeData = document.getElementById('route-data');

	    // Clear current info
	    $(".routeInfo").remove();

		var infoText = document.createElement('p');
	    infoText.innerHTML = "Route: " + shapeId[0];
	    infoText.className = 'routeInfo';

        routeData.appendChild(infoText);
	});

	google.maps.event.addListener(route_line, 'mouseout', function() {
     route_line.setOptions({
       strokeOpacity: 0.2,
       strokeWeight: 3
     });
	});

	// push new line
	routes.push(route_line);
}

function displayShapeInfo(shapeId) {
	var infoString = [];

	// Pull info based on shapeId
	var query = "SELECT 'route_id' FROM " + ftidTrips
    + " WHERE 'shape_id'='"+shapeId+"'"
    + " GROUP BY 'shape_id'"
    + "LIMIT 10"; 

	var encodedQuery = encodeURIComponent(query);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg');
	url.push('&callback=?');

	// Send the JSONP request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: 'jsonp',
	  success: function (data) {
	    var rows = data['rows'];
	    for (var i in rows) {
	      var routeId = rows[i][0];
	      // var headSign = rows[i][1];
		  infoString.push(routeId);
		  // holder.push(headSign);
	    }
	  }
	});

	var routeData = document.getElementById('route-data');

    // Clear current info
    $(".routeInfo").remove();

    for (var i in infoString) {
		var infoText = document.createElement('p');
	    infoText.innerHTML = infoString[i];
	    infoText.className = 'routeInfo';

        routeData.appendChild(infoText);
    }
}

function plotRoutes() {
	for (var i in routes) {
		routes[i].setMap(map);
	}
}

function routeColor(shapeId) {
	if (shapeId[1] === '.') {
		switch(shapeId[0]) {
			case '1':
			case '2':
			case '3':
				return "#EE352E";
				break;
			case '4':
			case '5':
			case '6':
				return "#00933C";
				break;
			case 'A':
			case 'C':
			case 'E':
				return "#2850AD";
				break;
			case 'B':
			case 'D':
			case 'F':
			case 'M':
				return '#FF6319';
				break;
			case 'N':
			case 'Q':
			case 'R':
				return "#FCCC0A";
				break;
			case 'J':
			case 'Z':
				return "#996633";
				break;
			case 'G':
				return "#6CBE45";
				break;
			case 'L':
				return "#A7A9AC";
				break;
			case 'S':
				return "#808183";
				break;
			case '7':
				return "#B933AD";
				break;
			default:
				return "#808183";
		}
	} else {
		return "#FFFFFF";
	}
}

function setPercentage(id, percent) {
	var div = document.getElementById(id);
	div.style.width = percent + '%';
}


function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}

function toggleRoutes() {
	route_line.setMap(route_line.getMap() ? null : map);
}

function toggleAllRoutes() {
	clearMap();
	for (var i in routes) {
		routes[i].setMap(map);
	}
}

function clearMap() {
	for (var i in routes) {
		routes[i].setMap(null);
	}
}

