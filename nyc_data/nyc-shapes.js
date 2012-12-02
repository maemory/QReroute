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

	// populate dropdown list
	// uniqueServiceId();
	// uniqueShapeId();
	// uniqueTripId();
	uniqueRouteId();
}

function uniqueRouteId() {
	var query = "SELECT 'route_id' FROM " + ftidRoutes
	     + " GROUP BY 'route_id'"
	     + " LIMIT 50"; 

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

	    plotPolylines(routes,map,backgroundRoutes);
	    setPercentage("loadProgress", 0);
	}
}


function getShapeIdFromServiceId() {

	clearPolylines(routes);
	cleanPolylines(routes);

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

	    plotPolylines(routes,map);
	    setPercentage("loadProgress", 0);
	}
}

function getShapeIdFromTripId() {

	clearPolylines(routes);
	cleanPolylines(routes);

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
		  backgroundPath.push(new google.maps.LatLng(lat_i,long_i));
	    }
	}

	// specify interactivity of polyline

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
	var query = "SELECT 'route_long_name','route_desc','route_url' FROM " + ftidRoutes
	    + " WHERE 'route_id'='"+routeId+"'"
	    + "LIMIT 1"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var routeData = document.getElementById('route-data');

	    var rows = data['rows'];

	    for (i in rows) {
	    	addDlListItems('Name',rows[i][0],'routeInfo',routeData);
	    	addDlListItems('Description',rows[i][1],'routeInfo',routeData);
	    	addDlListItems('More Info',rows[i][2],'routeInfo',routeData,'link');
	    }
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

function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}