/* ========================================================
 * NYC MTA Subway maps related javascript methods
 * ======================================================== */

// Global Variables
var map;						// The map
var transitLayer;				// google maps data overlays
var markers = [];				// array to hold markers
var routes = [];				// array to hold polylines
var backgroundRoutes = [];		// array to hold polylines
var services = [];				// array to hold services

var dataCenter;					// centering of map based on city selection

var selRouteId;
var selRouteColor;
var selServiceId;
var selTripId;
var selShapeId;
var selDay = 'monday';

function loadBar() {
	setTimeout(function(){
		$("#wrapper").fadeIn('slow');
	},1000);
}

function setDataSet(){
	// get input from select statement
	var selectInput = document.getElementById("data-select");
	var dataSet = selectInput.options[selectInput.selectedIndex].getAttribute('data-set');

	switch (dataSet) {
		case 'SFMTA':
			ftidAgency    = '16PxVQOgn5DeBrLabBXEhAIwidDtl8wBfv_rTk-E';
			ftidShapes    = '1fowA6JsonMOGGxR8OIyuPcM8SqFZdGTDjI3ZLPM';
			ftidTrips     = '1i2meZFHYydHYiq_XoacNjIt8CIz2P2Z1yKpa4uI';
			ftidStops     = '1bSTnRcDDhv56Xw3DqvU65QfFT9a8uW7wGD0jXts';
			// ftidStopTimes = '1uUBGmr92p2E1-Yb4vLFh4t23DkapZ6nOpjlXP9c';
			ftidRoutes    = '1uhXgYojzS6wEm-RoNC61EvPLrYI4fUdVi2Qq26k';
			ftidCalendar  = '1iPE4A40RRzxityVSZ6wIjI4PDCvj4Gsw8W9J-AY';
			dataCenter = new google.maps.LatLng(37.739348,-122.457809);
			break;

		case 'CTA':
			ftidShapes    = '1y26_NR7wKqdAOYC_ynnL452Qp3RRVHPz4qLv1dc';
			ftidTrips     = '1p2Ux_tIBUN-x3iwQI_kIzcrPnVQlCKJnQYuoDhU';
			ftidStops     = '18r6CB0BVprQb_4ZRIGlZNg-GwJ7Jo6AYkJbnNrE';
			// ftidStopTimes = '';
			ftidRoutes    = '1EW4TvRx8HutyqPENC4BfvE_m3sWIQWflPPkn-NE';
			ftidCalendar  = '1M69-7yIhvSKnkb_409CmpJVN19aCBttEyrr9_TU';
			ftidAgency    = '1d1Wu3tjK-S0FVss2cEDr_ErY5GCUYS2zi1i-57A';
			dataCenter = new google.maps.LatLng(41.9,-87.7);
			break;

		case 'BART':
			ftidShapes    = '1qhG923HlIE33kN39Uj9ynv0zfUZ_DmERytAvsN8';
			ftidTrips     = '1XQTqk31yI9XsPGWWcQuB_QVHw33koeP55rIWN0Q';
			ftidStops     = '1eHY-ncMWzJiOanfeFFytceidCkfsnvISnPRWNLw';
			// ftidStopTimes = '';
			ftidRoutes    = '1g6n7qZVyxWyxArzOvpSbho-yuxucaj81tv3GJMA';
			ftidCalendar  = '15bcav2--Oybrj0bYRGfLDEowF13lOiQXTUpDjeo';
			dataCenter = new google.maps.LatLng(37.739348,-122.457809);
			break;

		case 'WMATA':
			ftidAgency    = '1bjS6HvbI3JtOwMP8tF1_KmDE5MG26iFlaYqlQzg';
			ftidShapes    = '1Cf5SCbFXXKlTZyiGvkMou6cxdSmPe_NE_vaPS5M';
			ftidTrips     = '1RiLbpdFVi_rrtBMSENnxbBkCqW8IbiRZb9vZAx4';
			ftidStops     = '1BclmGuWcVE3KHbrrGUt6vsswv5g1RNXvq3Nl66E';
			// ftidStopTimes = '';
			ftidRoutes    = '1NGIa4kK32rU7xnAIabsPoxCSj2-lTtFyTQxV0b8';
			ftidCalendar  = '1bdhWPvQy4nE5rlfWa2LXmfOgIKVbstVf1158qec';
			dataCenter = new google.maps.LatLng(38.883825,-76.928735);
			break;

		case 'MTA':
		default:
			ftidAgency    = '11e7oGJETz29YKIf71LJha8jNSyXVYj5VyVhOEWo';
			ftidShapes    = '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk';
			ftidTrips     = '1I_yESx3I_Xet3JEM2l0DWHj76cu_gsx7vw2YYXM';
			ftidStops     = '17Y_13i04CsvoEVpm7qgQ4SpxJbl8K9c4u1vyVo0';
			// ftidStopTimes = '1WwkY8qCCEcUTJ-bw0-gRhn3KQ6d0cNsZ4-DCnxo';
			ftidRoutes    = '1nWHP5FJs_aPvCPDYYkG0GHHojbkvZDdjcnjoTfw';
			ftidCalendar  = '1wetKxVGhNZKw0P294iWNvkRGkZTTaOypDWi9b34';
			dataCenter = new google.maps.LatLng(40.753357,-73.984375);
	}

	dispAgencyInfo();

	// remove 'select city' option from select
    $(".sel-city").remove();

    // fade in/out additional nav
    $('#route-select').fadeIn('slow');
    $("#extra-select").fadeOut('fast');

    $("#init-text").fadeOut('fast');
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
	var query = "SELECT 'route_id','route_short_name','route_long_name','route_color' FROM " + ftidRoutes
	     // + " GROUP BY 'route_id','route_color'"
	     + " LIMIT 1000"; 

	queryTable(query,'jsonp',success);

	function success(data) {

	    // Clear current info
	    $(".route-option").remove();

	    var rows = data['rows'];

	    var ftData = document.getElementById('route-select');

	    var selectElement = document.createElement('option');
	    selectElement.innerHTML ="Select Route";
	    selectElement.className = 'route-option sel-route';

	    ftData.appendChild(selectElement);

	    for (var i in rows) {
	      var routeId = rows[i][0];
	      var routeShortName = rows[i][1].toLowerCase().toTitleCase();
	      var routeLongName = rows[i][2].toLowerCase().toTitleCase();
	      var routeColor = rows[i][3];

	      if (routeId.length > 0) {
		      var selectElement = document.createElement('option');

		      if (routeLongName.length > 0 && routeShortName.length > 0) {
		      	selectElement.innerHTML = routeShortName + ": " + routeLongName;
		      } else if (routeLongName.length > 0) {
		      	selectElement.innerHTML = routeLongName;
		      } else if (routeShortName.length > 0) {
		      	selectElement.innerHTML = routeShortName;
		      } else {
				selectElement.innerHTML = routeId;
		      }

	      	  selectElement.setAttribute('data-routeId',routeId);

		      if (routeColor.length > 0) {
		      	selectElement.setAttribute('data-color',routeColor);
		      } else {
		      	selectElement.setAttribute('data-color','03389C');
		      }

		      selectElement.className = 'route-option';

	          ftData.appendChild(selectElement);
	      }
	    }
	}
}

function setRouteId() {
	// get input from select statement
	var selectInput = document.getElementById("route-select");
	selRouteId = selectInput.options[selectInput.selectedIndex].getAttribute('data-routeId');
	selRouteColor = selectInput.options[selectInput.selectedIndex].getAttribute('data-color');

	// remove 'select route' option from select
    $(".sel-route").remove();

    // Add 'select heading' to heading select
    var appendTarget = document.getElementById('heading-select');
    var element = document.createElement('option');
    element.innerHTML = "Select Direction";
    element.className = 'heading-option sel-headsign';
    appendTarget.appendChild(element);

    // display route info
	dispRouteInfo(selRouteId);

    // remove 'uneditable-input' from route button
    $("#extra-select").fadeIn('slow');
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

    clearHeadingSelect();

    // Add select heading statement
    var appendTarget = document.getElementById('heading-select');
    var element = document.createElement('option');
    element.innerHTML = "Select Heading";
    element.className = 'heading-option sel-headsign';
    appendTarget.appendChild(element);


	var services = new Array;

	// Get list of possible services for selected day of week

	// Query and return shape_ids associated to this service_id
	var query = "SELECT 'service_id'  FROM " + ftidCalendar
		+ " WHERE '" + selDay + "'='1'"
		+ " GROUP BY 'service_id'"
	    + " LIMIT 100"; 

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

	    // now built, fade in the heading selector
	    $("#heading-select").fadeIn('fast');
	}
}

function constructServiceId(services) {

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
			  var headsign = rows[row][2].toLowerCase().toTitleCase();

		      // Add heading to list of headings
		      var appendTarget = document.getElementById('heading-select');

		      if (serviceId.length > 0 && shapeId.length > 0 && headsign.length > 0) {

				selServiceId = serviceId;

			    var element = document.createElement('option');
			    element.innerHTML = headsign;
			    element.className = 'heading-option';
			    element.setAttribute('data-shapeId',shapeId);

		        appendTarget.appendChild(element);
		      } else if (serviceId.length > 0 && shapeId.length > 0) {

				selServiceId = serviceId;

			    var element = document.createElement('option');
			    element.innerHTML = selRouteId + ' (' + serviceId + ')';
			    element.className = 'heading-option';
			    element.setAttribute('data-shapeId',shapeId);

		        appendTarget.appendChild(element);

		      }
		    }

		}		    
    }
}

function setShapeId() {
	// get input from select statement
	var selectInput = document.getElementById("heading-select");
	selShapeId = selectInput.options[selectInput.selectedIndex].getAttribute('data-shapeId');

	// remove 'select city' option from select
    $(".sel-headsign").remove();
}

function plotShapeId() {

	clearPolylines(routes);
	cleanPolylines(routes);
	clearPolylines(backgroundRoutes);
	cleanPolylines(backgroundRoutes);

	addPolyline(selShapeId,selRouteColor);

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

function addPolyline(shapeId,routeColor) {

	var polyOptions = {
	    strokeColor: '#' + routeColor,
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

	// google.maps.event.addListener(route_line, 'click',  function(event) {

	// });

	// push new line
	backgroundRoutes.push(backgroundLine);
	routes.push(route_line);
}

function dispAgencyInfo() {

    // Clear current info
    clearBottomInfo();

	// Pull info based on routeId
	var query = "SELECT 'agency_name','agency_url' FROM " + ftidAgency
	    + " LIMIT 5"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var bottomData = document.getElementById('info-data');

	    var rows = data['rows'];

	    console.log('agency info: ',rows);

	    for (i in rows) {

	    	var agencyName = rows[i][0].toLowerCase().toTitleCase();
	    	var agencyUrl = rows[i][1];

	  		if (agencyName.length > 0) {
		    	addDlListItems('Agency',agencyName,'bottomInfo',bottomData);
	  		}

	  		if (agencyUrl.length > 0) {
		    	addDlListItems('Website',agencyUrl,'bottomInfo',bottomData,'link');
	  		}

	    }

	    $('#bottom-data').fadeIn('fast');
	    setTimeout(function(){
			$('#bottom-data').fadeOut('2000');
	    },5000);

	}
}

function dispRouteInfo(routeId) {

    // Clear current info
    clearBottomInfo();

	// Pull info based on routeId
	var query = "SELECT 'route_id','route_short_name','route_long_name','route_desc','route_url' FROM " + ftidRoutes
	    + " WHERE 'route_id'='"+routeId+"'"
	    + "LIMIT 1"; 

	queryTable(query,'jsonp',success);

	function success(data) {
		var bottomData = document.getElementById('info-data');

	    var rows = data['rows'];

	    for (i in rows) {

	    	var routeId        = rows[i][0];
	    	var routeShortName = rows[i][1].toLowerCase().toTitleCase();
	    	var routeLongName  = rows[i][2].toLowerCase().toTitleCase();
	    	var routeDesc      = rows[i][3];
	    	var routeUrl       = rows[i][4];

	  		if (routeShortName.length > 0 && routeLongName.length > 0) {
	  			addDlListItems('Route',routeShortName + ": " + routeLongName,'bottomInfo',bottomData);
	  		} else if (routeLongName.length > 0) {
	  			addDlListItems('Route',routeLongName,'bottomInfo',bottomData);
	  		} else if (routeShortName.length > 0) {
	  			addDlListItems('Route',routeShortName,'bottomInfo',bottomData);
	  		} else {
		    	addDlListItems('Route',RouteId,'bottomInfo',bottomData);	  			
	  		}

	  		if (routeDesc.length > 0) {
		    	addDlListItems('Description',routeDesc,'bottomInfo',bottomData);
	  		}

	  		if (routeUrl.length > 0) {
		    	addDlListItems('Website',routeUrl,'bottomInfo',bottomData,'link');
	  		}

	    }

	    $('#bottom-data').fadeIn('fast');
	    setTimeout(function(){
			$('#bottom-data').fadeOut('2000');
	    },5000);

	}
}

function clearBottomInfo() {
    // Clear current info
    $(".bottomInfo").remove();
}

function clearHeadingSelect() {
    // Clear current info
    $(".heading-option").remove();
    // hide heading select menu
    $("#heading-select").fadeOut('fast');
}

function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}

// convert strings to title case
String.prototype.toTitleCase = function () {
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;

  return this.replace(/([^\W_]+[^\s-]*) */g, function (match, p1, index, title) {
    if (index > 0 && index + p1.length !== title.length &&
      p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" && 
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (p1.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};