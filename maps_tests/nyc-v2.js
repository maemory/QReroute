/* ========================================================
 * NYC MTA Subway maps related javascript methods
 * ======================================================== */

// Global Variables
var map;						// The map
var transitLayer,fusion_dat;	// google maps data overlays
var markers = [];				// array to hold markers
var routes = [];				// array to hold polylines
var backgroundRoutes = [];		// array to hold polylines
var services = [];				// array to hold services

var dataCenter;

var selRouteId;
var selServiceId;
var selTripId;
var selShapeId;
var selDay = 'monday';

function setDataSet(){
	// get input from select statement
	var selectInput = document.getElementById("data-select");
	var i = selectInput.selectedIndex;

	switch (i) {
		case 2:
			ftidShapes    = '1fowA6JsonMOGGxR8OIyuPcM8SqFZdGTDjI3ZLPM';
			ftidTrips     = '1i2meZFHYydHYiq_XoacNjIt8CIz2P2Z1yKpa4uI';
			ftidStops     = '1bSTnRcDDhv56Xw3DqvU65QfFT9a8uW7wGD0jXts';
			ftidStopTimes = '1uUBGmr92p2E1-Yb4vLFh4t23DkapZ6nOpjlXP9c';
			ftidRoutes    = '1uhXgYojzS6wEm-RoNC61EvPLrYI4fUdVi2Qq26k';
			ftidCalendar  = '1iPE4A40RRzxityVSZ6wIjI4PDCvj4Gsw8W9J-AY';
			dataCenter = new google.maps.LatLng(37.739348,-122.457809);
			break;

		case 3:
			ftidShapes    = '1y26_NR7wKqdAOYC_ynnL452Qp3RRVHPz4qLv1dc';
			ftidTrips     = '1p2Ux_tIBUN-x3iwQI_kIzcrPnVQlCKJnQYuoDhU';
			ftidStops     = '18r6CB0BVprQb_4ZRIGlZNg-GwJ7Jo6AYkJbnNrE';
			ftidStopTimes = '';
			ftidRoutes    = '1EW4TvRx8HutyqPENC4BfvE_m3sWIQWflPPkn-NE';
			ftidCalendar  = '1M69-7yIhvSKnkb_409CmpJVN19aCBttEyrr9_TU';
			dataCenter = new google.maps.LatLng(41.9,-87.7);
			break;

		default:
			ftidShapes    = '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk';
			ftidTrips     = '1I_yESx3I_Xet3JEM2l0DWHj76cu_gsx7vw2YYXM';
			ftidStops     = '17Y_13i04CsvoEVpm7qgQ4SpxJbl8K9c4u1vyVo0';
			ftidStopTimes = '1WwkY8qCCEcUTJ-bw0-gRhn3KQ6d0cNsZ4-DCnxo';
			ftidRoutes    = '1nWHP5FJs_aPvCPDYYkG0GHHojbkvZDdjcnjoTfw';
			ftidCalendar  = '1wetKxVGhNZKw0P294iWNvkRGkZTTaOypDWi9b34';
			dataCenter = new google.maps.LatLng(40.753357,-73.984375);

	}
}

function printGlobals() {
	console.log('selected route_id: ', selRouteId);
	console.log('selected day of service: ', selDay);
	console.log('selected service_id: ', selServiceId);
	console.log('selected shape_id: ', selShapeId);	
	console.log('selected trip_id: ' , selTripId);
}

function initializeMap() {

	var mapOptions = {
	  center: dataCenter,
	  zoom: 11,
	  streetViewControl: false,
	  panControl: false,
	  mapTypeId: google.maps.MapTypeId.HYBRID,
	};

	map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

	transitLayer = new google.maps.TransitLayer();

	// populate dropdown list
	uniqueRouteId();
}

// On page load the route selection dropdown is populated
function uniqueRouteId() {
	var query = "SELECT 'route_id' FROM " + ftidRoutes
	     + " GROUP BY 'route_id'"
	     + " LIMIT 1000"; 

	queryTable(query,'jsonp',success);

	function success(data) {

	    // Clear current info
	    $(".route-option").remove();

	    var rows = data['rows'];

	    var ftData = document.getElementById('route-select');

	    for (var i in rows) {
	      var trip = rows[i][0];

	      console.log("route: ",trip);

	      if (trip.length > 0) {
		      var selectElement = document.createElement('option');
		      selectElement.innerHTML = trip;
		      selectElement.className = 'route-option';

	          ftData.appendChild(selectElement);
	      }
	    }
	}
}

function setRouteId() {
	// get input from select statement
	var selectInput = document.getElementById("route-select");
	selRouteId = selectInput.options[selectInput.selectedIndex].text;

	dispRouteInfo(selRouteId);
}


function setDay() {
	// get input from select statement
	var selectInput = document.getElementById("day-select");
	var i = selectInput.selectedIndex;

	switch (i) {
		case 1:
			selDay = 'tuesday';
			break;
		case 2:
			selDay = 'wednesday';
			break;
		case 3:
			selDay = 'thursday';
			break;
		case 4:
			selDay = 'friday';
			break;
		case 5:
			selDay = 'saturday';
			break;
		case 6:
			selDay = 'sunday';
			break;
		default:
			selDay = 'monday';
	}
}

function setServiceId() {

	var services = new Array;

	// Get list of possible services for selected day of week

	// Query and return shape_ids associated to this service_id
	var query = "SELECT 'service_id'  FROM " + ftidCalendar
		+ " WHERE '" + selDay + "'='1'"
		+ " GROUP BY 'service_id'"
	    + " LIMIT 20"; 

	queryTable(query,'jsonp',successService);

	function successService(data) {

	    var rows = data['rows'];

	    for (var i in rows) {
	      var serviceId = rows[i][0];

	      if (serviceId.length > 0) {
			services.push(serviceId);
	      }
	    }

	    constructServiceId(services);
	}
}

function constructServiceId(services) {

    clearHeadingSelect();

	for (var i in services) {
		// Query and return service_id where selected route_id matches
		var query = "SELECT 'service_id','shape_id','trip_headsign'  FROM " + ftidTrips
			+ " WHERE 'route_id'='" + selRouteId + "' AND "
			+ "'service_id'='" + services[i] + "'"
			+ " GROUP BY 'service_id','shape_id','trip_headsign'"
		    + " LIMIT 50"; 

		queryTable(query,'jsonp',successServiceId);

		function successServiceId(data) {
		    var rows = data['rows'];

		    for (var row in rows) {
		      var serviceId = rows[row][0];
			  var shapeId = rows[row][1];
			  var headsign = rows[row][2];

		      if (serviceId.length > 0 && shapeId.length > 0 && headsign.length > 0) {
				selServiceId = serviceId;

			    // Add heading to list of headings
			    var appendTarget = document.getElementById('heading-select');

			    var element = document.createElement('option');
			    element.innerHTML = headsign;
			    element.className = 'heading-option';
			    element.setAttribute('data-shapeId',shapeId);

		        appendTarget.appendChild(element);
		      }
		    }
		}		    
    }

}

function setServiceId2 () {
	// Based on user selected values for pull-down menus build service_id
	var leadChar;
	switch(selRouteId){
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '6X':
			leadChar = 'A';
			break;

		case '7':
		case '7X':
		case 'A':
		case 'B':
		case 'C':
		case 'D':
		case 'E':
		case 'F':
		case 'FS':
		case 'G':
		case 'GS':
		case 'H':
		case 'J':
		case 'L':
		case 'M':
		case 'N':
		case 'Q':
		case 'R':
		case 'SI':
		case 'Z':
		leadChar = 'B';
	}

	selServiceId = leadChar + ftDate + selDay;

	// Query and return shape_ids associated to this service_id
	var query = "SELECT 'shape_id', 'trip_headsign'  FROM " + ftidTrips
		+ " WHERE 'service_id'='" + selServiceId + "' AND 'route_id'='" + selRouteId + "'"
		+ " GROUP BY 'shape_id', 'trip_headsign'"
	    + " LIMIT 20"; 

	queryTable(query,'jsonp',successShape);

	function successShape(data) {

	    // Clear current info
	    $(".shape-option").remove();

	    var rows = data['rows'];

	    var appendTarget = document.getElementById('heading-select');

	    for (var i in rows) {
	      var shapeId = rows[i][0];
	      var headsign = rows[i][1];

	      if (shapeId.length > 0) {
		    var element = document.createElement('option');
		    element.innerHTML = headsign;
		    element.className = 'shape-option';
		    element.setAttribute('data-shapeId',shapeId);

	        appendTarget.appendChild(element);
		      }
	    }
	}
}

function setShapeId() {
	// get input from select statement
	var selectInput = document.getElementById("heading-select");
	selShapeId = selectInput.options[selectInput.selectedIndex].getAttribute('data-shapeId');
}

function plotShapeId() {

	clearPolylines(routes);
	cleanPolylines(routes);
	clearPolylines(backgroundRoutes);
	cleanPolylines(backgroundRoutes);

	addPolyline(selShapeId);

    plotPolylines(backgroundRoutes,map);
    plotPolylines(routes,map);
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

function getShapeIdFromRouteId() {

	clearPolylines(routes);
	cleanPolylines(routes);
	clearPolylines(backgroundRoutes);
	cleanPolylines(backgroundRoutes);

	// get input from select statement
	var selectInput = document.getElementById("shape-select");
	var routeId = selectInput.options[selectInput.selectedIndex].text;

	var query = "SELECT 'shape_id' FROM " + ftidTrips
		+ " WHERE 'route_id'='"+routeId+"'"
		+ " GROUP BY 'shape_id'"
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
		    shapeElement.innerHTML = 'Polyine #' + count + ': ' + shapeId;
		    shapeElement.className = 'shape-disp';

	        ftData.appendChild(shapeElement);

		    addPolyline(shapeId);
	  	    count++;
  	      }

  	      var percentage = 100 * i / (rows.length-1);
	      setPercentage("loadProgress", percentage);
	    }

	    plotPolylines(backgroundRoutes,map);
	    plotPolylines(routes,map);
	    setPercentage("loadProgress", 0);
	}
}


function getShapeIdFromServiceId() {

	clearPolylines(routes);
	cleanPolylines(routes);
	clearPolylines(backgroundRoutes);
	cleanPolylines(backgroundRoutes);

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

	    plotPolylines(backgroundRoutes,map);
	    plotPolylines(routes,map);
	    setPercentage("loadProgress", 0);
	}
}

function getShapeIdFromTripId() {

	clearPolylines(routes);
	cleanPolylines(routes);
	clearPolylines(backgroundRoutes);
	cleanPolylines(backgroundRoutes);

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

	    plotPolylines(backgroundRoutes,map);
	    plotPolylines(routes,map);
	    setPercentage("loadProgress", 0);
	}
}

function addPolyline(shapeId) {

	var polyOptions = {
	    strokeColor: routeColor(shapeId),
	    strokeOpacity: 1.0,
	    strokeWeight: 2,
	}

	var polyBackOptions = {
	    strokeColor: '#FFFFFF',
	    strokeOpacity: 1.0,
	    strokeWeight: 4,
	}

	var backgroundLine = new google.maps.Polyline(polyBackOptions);
	var route_line = new google.maps.Polyline(polyOptions);

	var backgroundPath = backgroundLine.getPath();
	var path = route_line.getPath();

	setPercentage("loadProgress", 5);

	var query = "SELECT 'shape_pt_lat','shape_pt_lon' FROM " + ftidShapes
	    + " WHERE 'shape_id'='" + shapeId + "'"
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
		  backgroundPath.push(new google.maps.LatLng(lat_i,long_i));
	    }
	}

	// specify interactivity of polyline
	setPercentage("loadProgress", 80);
	google.maps.event.addListener(route_line, 'mouseover', function() {
	    route_line.setOptions({
	       // strokeOpacity: 1,
	       strokeWeight: 3.5
	    });
    });

	google.maps.event.addListener(route_line, 'mouseout', function() {
	    route_line.setOptions({
	       // strokeOpacity: 0.2,
	       strokeWeight: 2
	    });
	});

	google.maps.event.addListener(route_line, 'click',  function(event) {
		dispShapeIdInfo(shapeId);
	});

	// push new line
	backgroundRoutes.push(backgroundLine);
	routes.push(route_line);
	setPercentage("loadProgress", 0);
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
	    clearRouteInfo();

	    var rows = data['rows'];

	    for (i in rows) {
	    	addDlListItems('Route',rows[i][0],'routeInfo',routeData);
	    }

	    dispRouteInfo(rows[i][0]);
	}
}

function dispRouteInfo(routeId) {

    // Clear current info
    clearRouteInfo();

	// Pull info based on routeId
	var query = "SELECT 'route_long_name','route_desc','route_url' FROM " + ftidRoutes
	    + " WHERE 'route_id'='"+routeId+"'"
	    + "LIMIT 1"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var routeData = document.getElementById('route-data');

	    var rows = data['rows'];

	    for (i in rows) {
	    	addDlListItems('Route',routeId,'routeInfo',routeData);
	    	addDlListItems('Name',rows[i][0],'routeInfo',routeData);
	    	addDlListItems('Description',rows[i][1],'routeInfo',routeData);
	    	addDlListItems('More Info',rows[i][2],'routeInfo',routeData,'link');
	    }
	}
}

function clearRouteInfo() {
    // Clear current info
    $(".routeInfo").remove();
}

function clearHeadingSelect() {
    // Clear current info
    $(".heading-option").remove();
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

function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}