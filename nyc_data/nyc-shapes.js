/* ========================================================
 * Mike Emory maps related java script methods
 * ======================================================== */
// google.load('visualization', '1.0', {'packages':['corechart','table']});

var map;
var transitLayer,fusion_dat;
var markers = [];
var route_line;


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

	var newYork = new google.maps.LatLng(40.671987,-73.964375);

	var mapOptions = {
	  center: newYork,
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

	// populate list of routes
	uniqueShapes();
}

function uniqueShapes() {
	var query = "SELECT 'shape_id' FROM " +
	    '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk'
	     + " GROUP BY 'shape_id'"
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

function drawPolyline() {

	// get input from select statement
	var selectInput = document.getElementById("shape-select");
	var strRoute = selectInput.options[selectInput.selectedIndex].text;

	var routeColor;

	switch(strRoute[0]) {
		case '1':
		case '2':
		case '3':
			routeColor = "#EE352E";
			break;
		case '4':
		case '5':
		case '6':
			routeColor = "#00933C";
			break;
		case 'A':
		case 'C':
		case 'E':
			routeColor = "#2850AD";
			break;
		default:
			routeColor = "#B933AD";
	}

	var polyOptions = {
	    strokeColor: routeColor,
	    strokeOpacity: 0.7,
	    strokeWeight: 3,
	}

	clearMap();

	route_line = new google.maps.Polyline(polyOptions);

	var path = route_line.getPath();

	var query = "SELECT 'shape_pt_lat','shape_pt_lon' FROM " +
	    '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk' + " WHERE 'shape_id'='"+strRoute+"'"
	     + " ORDER BY 'shape_pt_sequence'"
	     + "LIMIT 10000"; 

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
	      // var dataElement = document.createElement('div');
	      // var locElement = document.createElement('p');
	      // locElement.innerHTML = 'Point ' + i + ': ' + lat_i + ', ' + long_i;
	      // locElement.className = 'latLng-disp';

	      // if (i < 10) {
	      //     dataElement.appendChild(locElement);
	      //     ftData.appendChild(dataElement);
	      // }

	      var next_loc = new google.maps.LatLng(lat_i,long_i);

		  path.push(next_loc);
	    }
	  }
	});
	route_line.setMap(map);
}

function toggleTransit() {
	transitLayer.setMap(transitLayer.getMap() ? null : map);
}

function toggleRoutes() {
	route_line.setMap(route_line.getMap() ? null : map);
}

function clearMap() {
	if (route_line) {
		route_line.setMap(null);
	}
}
