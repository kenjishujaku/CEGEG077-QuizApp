function menuClicked(){
	alert("You clicked the menu");
}


// load the map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
maxZoom: 18,
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,'+
'Imagery © <a href="http://mapbox.com">Mapbox</a>',
id: 'mapbox.streets'
}).addTo(mymap);

// create funtions for popup displaying clicked location	
var popup = L.popup();

function onMapClick(e) {
	var longitude = e.latlng.lng;
	var latitude = e.latlng.lat;
	
	
	var popupContent = '<div><label for="firstname">First Name: </label><input type="text" size="15" id="firstname1"/></div>'+
			'<div><label for="lastname">Last Name: </label><input type="text" size="15" id="lastname1"/></div>'+
			'<div"><label>Module Code: </label></div><select name="moduleselectbox" id="moduleselectbox1">'+
				'<option value="">Select Module</option><option>CEGEG075</option>'+
				'<option>CEGEG076</option><option>CEGEG077</option>'+
				'<option>CEGEG129</option></select>'+
			'<div><label for="location_name">Point Name: </label><input type="text" size="15" id="pointname"/></div>'+
			'<div><label for="latitude">Latitude</label><input type="text" name="latitude" size="15" id="latitude1"/></div>'+
			'<div><label for="longitude">Longitude</label><input type="text" name="longitude" size="15" id="longitude1"/></div>'+
			'<div><button id="startUpdate" onclick="startDataUpdate()">Start Data Update</button></div>';
	popup
		.setLatLng(e.latlng)
		.setContent("<b>You clicked the map at </b><b align='center' style='popupcontent'>("+e.latlng.lng.toFixed(5).toString()+","+e.latlng.lat.toFixed(5).toString()+")<br />"+popupContent)
		.openOn(mymap);	
		
};
// now add the click event detector to the map
mymap.on('click', onMapClick);

// create a function for calculating distance 
// function getDistance() {
		// alert('getting distance');
		// getDistanceFromPoint is the function called once the distance has been found
		// navigator.geolocation.getCurrentPosition(getDistanceFromPoint);}
		

var lat_warrentSt = 51.524479;
var lng_warrentSt = -0.137998;
		


// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
	// where radius of the earth is 3956 miles
	if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
	if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
	return dist;
}


// create functions for tracking user's Location
function trackLocation() {
	if (navigator.geolocation) {
	// confirm("show your current position")
	 var options = {watch:true,enableHighAccuracy:true,frequency:500};
	navigator.geolocation.watchPosition(onSuccess,onError,options);
 } else {
	document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
 }
}

var currentlocationlayer;
var myQuestions;
var Questions;
var test;
var quizContainer;
var resultsContainer;
var submitButton;

function onSuccess(position) {
	if (mymap.hasLayer(currentlocationlayer)){
		mymap.removeLayer(currentlocationlayer);
	}
	var distanceWarrenSt = calculateDistance(position.coords.latitude, position.coords.longitude, lat_warrentSt,lng_warrentSt, 'K');
	
	document.getElementById('showDistanceWarrenSt').innerHTML = "To Warren Street: "+distanceWarrenSt.toFixed(2) + " (km)";
	
	if (geoJSONlocations.length!==0){
		
		for (i in geoJSONlocations){
			
			
			lat = geoJSONlocations[i][1]
			lng = geoJSONlocations[i][0]
			var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
			
			if (distance < 0.02){

				// create function for creating quiz form
				myQuestions = [
				{
					question: geoJSONquestions[i],
					answers: {
						choice1: geoJSONchoices[i][0],
						choice2: geoJSONchoices[i][1],
						choice3: geoJSONchoices[i][2],
						choice4: geoJSONchoices[i][3],
					},
					correctAnswer: geoJSONanswers[i]
				},
				];
				
				if (Questions==undefined || (isEquivalent(myQuestions,Questions))==false){
					alert("you are close to a quiz point, a quiz will be coming");
					Questions = myQuestions
					document.getElementById('quiz').style.marginTop = "20px";
					document.getElementById('quiz').style.lineHeight = "2";
					document.getElementById('quiz').style.fontSize = "large";
					quizContainer = document.getElementById('quiz');
					document.getElementById('results').style.marginTop = "10px";
					document.getElementById('results').style.lineHeight = "1.3";
					document.getElementById('results').style.fontSize = "large";
					resultsContainer = document.getElementById('results');
					submitButton = document.getElementById('submit');
					generateQuiz(myQuestions, quizContainer, resultsContainer, submitButton);
				}			
			}
		}
	}
	
	// create a geoJSON feature -
	var geojsonFeature = {
		"type": "Feature",
		"properties": {
		"name": "Your Location",
		"popupContent": [position.coords.longitude.toFixed(4), position.coords.latitude.toFixed(4)]
		},
		"geometry": {
		"type": "Point",
		"coordinates": [position.coords.longitude, position.coords.latitude]
		}
	};	
	
	// create Maker icon 
	var testMarkerPink = L.AwesomeMarkers.icon({
		icon: 'play',
		markerColor: 'pink'
	
	});	
	
	currentlocationlayer = L.geoJSON(geojsonFeature, {
			pointToLayer: function (feature, latlng) {
				return L.marker(latlng, {icon:testMarkerPink});
			}
		}).addTo(mymap).bindPopup("<b>"+geojsonFeature.properties.name+"("+
		geojsonFeature.properties.popupContent+" )</b>");
		
	mymap.flyToBounds(currentlocationlayer.getBounds(),{maxZoom:17});
}

// onError Callback receives a PositionError object
function onError(error) {
	alert('code: '    + error.code    + '\n' +
		  'message: ' + error.message + '\n');
}

// add AJAX call and response method to code
var client;
function getGeoJSONfile(){
	client = new XMLHttpRequest();
	client.open('GET', 'http://developer.cege.ucl.ac.uk:30282/getGeoJSONfile' ,true);
	client.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	client.onreadystatechange = geoJSONResponse;
	client.send();
}

// create the code to wait for the response from the data server, and process the response once it is received
function geoJSONResponse() {
	// this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4) {
	  // once the data is ready, process the data
	  var geoJSONString = client.responseText;
	  processGeoJSONfile(geoJSONString);
	
  }
}

var geoJSONquestions = [];
var geoJSONchoices = [];
var geoJSONlocations = [];
var geoJSONanswers = [];
var geoJSONlocationnames = [];
var questionpointlayer;

// get GeoJSON file from database
function processGeoJSONfile(geoJSONString){
	alert("Start Processing")
	// convert the string of downloaded data to JSON
	var geoJSON = JSON.parse(geoJSONString);
	var questionpointlayer = L.geoJson(geoJSON,{
		// use point to layer to create the points
		pointToLayer: function (feature, latlng){
			// look at the GeoJSON file - specifically at the properties - to see the earthquake magnitude and use a different marker depending on this value
			// also include a pop-up that shows the place value of the earthquakes
			geoJSONquestions.push([feature.properties.question])
			geoJSONchoices.push([feature.properties.choice_1,feature.properties.choice_2,feature.properties.choice_3,feature.properties.choice_4])
			geoJSONlocations.push([latlng.lng,latlng.lat])
			geoJSONanswers.push([feature.properties.correct_answer])
			geoJSONlocationnames.push([feature.properties.location_name])
			
			if (feature.properties.location_name=="Warren Street Station"){
				return L.marker(latlng, {icon:testMarkerYellow}).bindPopup("<b>"+"Name: "+feature.properties.first_name+" "+feature.properties.last_name+"<br />"+feature.properties.location_name+"</b>");
			}else{
				return L.marker(latlng, {icon:testMarkerBlue}).bindPopup("<b>"+"Name: "+feature.properties.first_name+" "+feature.properties.last_name+"<br />"+feature.properties.location_name+"</b>");
			}
			
		},
    }).addTo(mymap);
}




var testMarkerBlue = L.AwesomeMarkers.icon({
    icon: 'play',
    markerColor: 'blue'
    });
	
var testMarkerYellow = L.AwesomeMarkers.icon({
    icon: 'play',
    markerColor: 'yellow'
    });


function generateQuiz(questions, quizContainer, resultsContainer, submitButton){

    function showQuestions(questions, quizContainer){
        // we'll need a place to store the output and the answer choices
        var output = [];
        var answers;

        // for each question...
        for(var i=0; i<questions.length; i++){
            
            // first reset the list of answers
            answers = [];

            // for each available answer...
            for(letter in questions[i].answers){

                // ...add an html radio button
                answers.push(
                    '<label>'
                        + '<input type="radio" name="question'+i+'" value="'+letter+'">'
                        + letter + ': '
                        + questions[i].answers[letter]
                    + '</label><br />'
                );
            }
            // add this question and its answers to the output
            output.push(
                '<div class="question">' + questions[i].question + '</div>'
                + '<div class="answers">' + answers.join('') + '</div>'
            );
        }

        // finally combine our output list into one string of html and put it on the page
        quizContainer.innerHTML = output.join('');
		// alert(output.join(''));
    }


    function showResults(questions, quizContainer, resultsContainer){
        
        // gather answer containers from our quiz
        var answerContainers = quizContainer.querySelectorAll('.answers');
        
        // keep track of user's answers
        var userAnswer = '';
        
        // for each question...
        for(var i=0; i<questions.length; i++){
			
            userAnswer = (answerContainers[i].querySelector('input[name=question'+i+']:checked')||{}).value;
            // alert(questions[i].correctAnswer);
			// alert(userAnswer);
            // if answer is correct
            if(userAnswer==questions[i].correctAnswer){
                // add to the number of correct answers
                resultsContainer.innerHTML = '<font color="green">Correct</font>';
                
                // color the answers green
                answerContainers[i].style.color = 'lightgreen';
            }
            // if answer is wrong or blank
            else{
				for(letter in questions[i].answers){
					if (letter == questions[i].correctAnswer){
						var answer = questions[i].answers[letter];
					}
				}
				resultsContainer.innerHTML = '<font color="red">Incorrect: </font>' + ' Answer is '+ answer;
                // color the answers red
                answerContainers[i].style.color = 'red';
            }
        }
    }

    // show questions right away
    showQuestions(questions, quizContainer);
    
    // on submit, show results
    submitButton.onclick = function(){
        showResults(questions, quizContainer, resultsContainer);
    }

}
		

function isEquivalent(a, b) {
    // Create arrays of property names
    var aQues = a[0].question;
    var bQues = b[0].question;
	var aAns = a[0].answers;
    var bAns = b[0].answers;
	if (aQues!==bQues){
		return false;
	}
	// alert(aProps[2]);
	// alert(bProps.length);
    // If number of properties is different,
    // objects are not equivalent
    for (var i= 0; i < aAns.length; i++) {
        if (aAns['choice'+i] !== bAns['choice'+i]) {
            return false;
        }
    }
    // If we made it this far, objects
    // are considered equivalent
    return true;
}

// add function to test that everything is working and upload it to the js sub directory
// create a function to get the first bit of text data from the from
function startDataUpdate(){
	confirm("Start Data Update");
	
	var pointname = document.getElementById("pointname").value;
	var firstname = document.getElementById("firstname1").value;
	var lastname = document.getElementById("lastname1").value;
	var module = document.getElementById("moduleselectbox1").value;
	var postString = "pointname="+pointname+"&firstname="+firstname +"&lastname=" +lastname +"&module=" +module;
	alert(firstname+" "+lastname+" "+module);
	
	
	var latitude = document.getElementById("latitude1").value;
	var longitude = document.getElementById("longitude1").value;
	
	postString = postString +"&latitude=" + latitude + "&longitude=" + longitude;
	updateData(postString)
}

// add AJAX call and response method to code
var client;

function updateData(postString){
	client = new XMLHttpRequest();
	client.open('POST', 'http://developer.cege.ucl.ac.uk:30282/updateData' ,true);
	client.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	client.onreadystatechange = dataUpdate;
	client.send(postString);
}

// create the code to wait for the response from the data server, and process the response once it is received 
function dataUpdate(){
	// this function listens out for the server to say tha the data is ready 
	if (client.readyState == 4){
		// change the DIV to show the response
		alert ("Update Has Completed")
	}
}
