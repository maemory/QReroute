/* ========================================================
 * GTFS mapping data reading library. For data stored in GTFS format
 * in Google Fusion Tables
 * Author: Michael Emory
 * ======================================================== */

// These should be defined by the user
var ftidShapes    = '1i2RNtijNTRAaoFMjbUX1wMo3smc2nQkAsCRfPBk';
var ftidTrips     = '1I_yESx3I_Xet3JEM2l0DWHj76cu_gsx7vw2YYXM';
var ftidStops     = '17Y_13i04CsvoEVpm7qgQ4SpxJbl8K9c4u1vyVo0';
var ftidStopTimes = '1WwkY8qCCEcUTJ-bw0-gRhn3KQ6d0cNsZ4-DCnxo';
var ftidRoutes    = '1nWHP5FJs_aPvCPDYYkG0GHHojbkvZDdjcnjoTfw';
var ftidCalendar  = '1wetKxVGhNZKw0P294iWNvkRGkZTTaOypDWi9b34';


var apikey = 'AIzaSyBT-Qxgp6JYWM9Hxjv5Gcd91vVtPFjsptg';

// designed currently to only work with jsonp requests
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
	  error: queryError,
	});
}

function queryError(jqXHR,textStatus,errorThrown) {
	console.log('Error in SQL request: ' + textStatus);
	if (errorThrown) {
		console.log('Error thrown: ' + errorThrown);
	}
}

function addDlListItems(title,text,target_class,target,type) {

	var titleText = document.createElement('dt');
    titleText.innerHTML = title;
    titleText.className = target_class;
    target.appendChild(titleText);

	var descText = document.createElement('dd');
	switch(type){
		case 'link':
		    descText.innerHTML = "<a href='" + text + "'>" + text + "</a>";		
			break;
		case 'text':
		default:
			// type is null or just want text
		    descText.innerHTML = text;
	}
    descText.className = target_class;
    target.appendChild(descText);

}

function plotPolylines(polyArray,targetMap,backgroundPolyArray) {
	if (targetMap != null) {
		map = targetMap;
	}

	if (backgroundPolyArray) {
		for (var i in backgroundPolyArray) {
			backgroundPolyArray[i].setMap(map);
		}
	}

	for (var i in polyArray) {
		polyArray[i].setMap(map);
	}
}

function cleanPolylines(polyArray) {
	polyArray.splice(0,polyArray.length);
}


function setPercentage(id, percent) {
	var div = document.getElementById(id);
	div.style.width = percent + '%';
}

function clearPolylines(polyArray) {
	for (var i in polyArray) {
		polyArray[i].setMap(null);
	}
}

