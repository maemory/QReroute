/* ========================================================
 * GTFS mapping data reading library. For data stored in GTFS format
 * in Google Fusion Tables
 * Author: Michael Emory
 * ======================================================== */

// These should be defined by the user
var ftidShapes = '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk';
var ftidTrips = '1I_yESx3I_Xet3JEM2l0DWHj76cu_gsx7vw2YYXM';
var ftidStops = '17Y_13i04CsvoEVpm7qgQ4SpxJbl8K9c4u1vyVo0';
var ftidStopTimes = '1WwkY8qCCEcUTJ-bw0-gRhn3KQ6d0cNsZ4-DCnxo';
var ftidRoutes = '1nWHP5FJs_aPvCPDYYkG0GHHojbkvZDdjcnjoTfw';

var apikey = 'AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg';

var map;
var transitLayer,fusion_dat;
var markers = [];
var routes = [];
var services = [];

function initialize() {

	var newYork = new google.maps.LatLng(40.753357,-73.984375);

	var mapOptions = {
	  center: newYork,
	  zoom: 12,
	  streetViewControl: false,
	  panControl: false,
	  mapTypeId: google.maps.MapTypeId.HYBRID,
	};

	map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

	transitLayer = new google.maps.TransitLayer();

	// populate list of routes
	uniqueServiceId();
	// uniqueShapeId();
	// uniqueTripId();
}

// designed urrently to only work with jsonp requests
function queryTable(queryString,dataType,successFunc) {
	var encodedQuery = encodeURIComponent(queryString);

	// Construct the URL
	var url = ['https://www.googleapis.com/fusiontables/v1/query'];
	url.push('?sql=' + encodedQuery);
	url.push('&key=' + apikey);
	url.push('&callback=?');

	// Send the request using jQuery
	$.ajax({
	  url: url.join(''),
	  dataType: dataType,
	  success: successFunc,
	  error: function (textStatus) {
	  	console.log('Error in SQL request: ' + textStatus);
	  },
	});
}

function uniqueShapeId() {
	var query = "SELECT 'shape_id' FROM " + ftidTrips
	     + " GROUP BY 'shape_id'"
	     + " LIMIT 10"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var rows = data['rows'];
		if (rows === null) {
			alert('No data received');
		} else {
			var ftData = document.getElementById('shape-select');

		    for (var i in rows) {
		      var route = rows[i][0];

		      if (route.length > 0) {
			      var selectElement = document.createElement('option');
			      selectElement.innerHTML = route;
			      selectElement.className = 'select-disp';

		          ftData.appendChild(selectElement);
		      }
		    }
		}
	};
}

function uniqueTripId() {
	var query = "SELECT 'trip_id' FROM " + ftidStopTimes
	     + " GROUP BY 'trip_id'"
	     + " LIMIT 5"; 

	queryTable(query,'jsonp',success);

	function success(data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('shape-select');
	    for (var i in rows) {
	      var trip = rows[i][0];

	      if (trip.length > 0) {
		      var selectElement = document.createElement('option');
		      selectElement.innerHTML = trip;
		      selectElement.className = 'select-disp';

	          ftData.appendChild(selectElement);
	      }
	    }
	}
}

function uniqueServiceId() {
	var query = "SELECT 'service_id' FROM " + ftidTrips
	     + " GROUP BY 'service_id'"
	     + " LIMIT 50"; 

	queryTable(query,'jsonp',successServiceId);

	function successServiceId(data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('shape-select');
	    for (var i in rows) {
	      var service = rows[i][0];

		    if (service.length > 0) {
		      var selectElement = document.createElement('option');
		      selectElement.innerHTML = service;
		      selectElement.className = 'select-disp';

	          ftData.appendChild(selectElement);
		    }
	    }
	}
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

	queryTable(query,'jsonp',successShape);

	function successShape(data) {
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

  	      var percentage = 100 * i / (rows.length-1);
	      setPercentage("loadProgress", percentage);
	    }

	    plotRoutes();
	    setPercentage("loadProgress", 0);
	}
}

function getShapeIdFromTripId() {
	// get input from select statement
	var selectInput = document.getElementById("shape-select");
	var tripId = selectInput.options[selectInput.selectedIndex].text;

	var query = "SELECT 'shape_id' FROM " + ftidTrips
		+ " WHERE 'trip_id'='"+tripId+"'"
	     + "LIMIT 1"; 

	queryTable(query,'jsonp',success);

	function success(data) {
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

  	      var percentage = 100 * i / (rows.length-1);
	      setPercentage("loadProgress", percentage);
	    }

	    plotRoutes();
	    setPercentage("loadProgress", 0);
	}
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

	queryTable(query,'jsonp',success);

	function success(data) {
	    var rows = data['rows'];
	    var ftData = document.getElementById('ft-data');
	    for (var i in rows) {
	      var lat_i = rows[i][0];
	      var long_i = rows[i][1];

		  path.push(new google.maps.LatLng(lat_i,long_i));
	    }
	}

	// specify interactivity of polyline

	google.maps.event.addListener(route_line, 'mouseover', function() {
	    route_line.setOptions({
	       strokeOpacity: 1,
	       strokeWeight: 4
	    });
    });

	google.maps.event.addListener(route_line, 'mouseout', function() {
	    route_line.setOptions({
	       strokeOpacity: 0.2,
	       strokeWeight: 3
	    });
	});

	google.maps.event.addListener(route_line, 'click',  function(event) {
		dispShapeIdInfo(shapeId);
	});

	// push new line
	routes.push(route_line);
}

function dispShapeIdInfo(shapeId) {
	// Pull info based on shapeId
	var query = "SELECT 'route_id' FROM " + ftidTrips
	    + " WHERE 'shape_id'='"+shapeId+"'"
	    + " GROUP BY 'route_id'"
	    + "LIMIT 1"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var routeData = document.getElementById('route-data');

	    // Clear current info
	    $(".routeInfo").remove();

	    var rows = data['rows'];

	    for (i in rows) {
	    	addDlListItems('Route',rows[i][0],'routeInfo',routeData);
	    }

	    dispRouteInfo(rows[i][0]);
	}
}

function dispRouteInfo(routeId) {
	// Pull info based on routeId
	var query = "SELECT 'route_long_name','route_desc' FROM " + ftidRoutes
	    + " WHERE 'route_id'='"+routeId+"'"
	    + "LIMIT 1"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var routeData = document.getElementById('route-data');

	    var rows = data['rows'];

	    for (i in rows) {
	    	addDlListItems('Name',rows[i][0],'routeInfo',routeData);
	    	addDlListItems('Description',rows[i][1],'routeInfo',routeData);
	    }
	}
}

function addDlListItems(title,text,target_class,target) {
	var titleText = document.createElement('dt');
    titleText.innerHTML = title;
    titleText.className = target_class;
    target.appendChild(titleText);

	var descText = document.createElement('dd');
    descText.innerHTML = text;
    descText.className = target_class;
    target.appendChild(descText);
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

