// Set global variables
var myMap ={};
var controlLayers ={}; 

// STEP ONE

// Get data set

// Store our API endpoint inside queryUrl
// For earthquake information
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// For tectonic plate information
var anotherQueryUrl =  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Perform a GET request to the query URL
d3.json(queryUrl).then(earthquakeData => {

  // Perform a GET request to the tetonic query URL
  d3.json(anotherQueryUrl).then(tectonicData => {

// STEP TWO
// Import and visualise the data

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(earthquakeData.features);

    // Once we get a response, send the data.features object to the createOverlay function
    createOverlay(tectonicData.features);

  });
});


// Set colors for circles
var color = ["#7CFC00", "#DFFF00", "#FFFF31", "#F4C430", "#FF7518", "#FF0800"];

//function to return color of circle
function getColor(magnitude) {
    if (magnitude < 1) {
        return color[0];
    }
    else if (magnitude < 2) {
        return color[1];
    }
    else if (magnitude < 3) {
        return color[2];
    }
    else if (magnitude < 4) {
        return color[3];
    }
    else if (magnitude < 5) {
        return color[4];
    }
    else {
        return color[5];
    }
}

// Function to create marker size for earthquakes
function calcRadius(magnitude) {
  return (magnitude/5) * 20;
}

// Function to create marker layer and popup for earthquake data
function createFeatures(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {

    // Create circle markers based on earthquake magnitude
    pointToLayer: function(feature) {
      return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          fillColor: getColor(+feature.properties.mag), // Use function to apply marker fill based on magnitude
          color: "rgb(153,51,204)",
          weight: 0.5,
          opacity: 0.7,
          fillOpacity: 0.7,
          radius: calcRadius(+feature.properties.mag) // Use function to calculate radius based on magnitude 
      });
    },

    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function(feature, layer) { layer.bindPopup("<h5>" + feature.properties.place +
      "</h5><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
      
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}



// Function to create map layers
function createMap(earthquakes) {

    //create a satellite tile layer
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={accessToken}", {
          attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
          maxZoom: 18,
          id: "mapbox.satellite",
          accessToken: API_KEY
      });

    //create a light tile layer
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });

    //create an terrain tile layer
    var outdoors =  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

      // Define a baseMaps object to hold our base layers
      var baseMaps = {
        "Satellite": satellitemap,
        "Grayscale": lightmap,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
    };

    // Create the map with our layers
    myMap = L.map("map", {
      center: [32.00, -87.00],
      zoom: 3,
      layers: [satellitemap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    controlLayers = L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend to myMap
    info.addTo(myMap);

};


// Create legend and position on bottom right of map
var info = L.control({position: "bottomright"});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {

  // Create a <div> element to insert legend
  var div = L.DomUtil.create("div", "legend");

  // Create labels and values to find colors
  var magnitudeLabels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
  var magnitudeScale = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

  // Create the legend inner html
  div.innerHTML = '<div><strong>Legend</strong></div>';
  for (var i = 0; i < magnitudeScale.length; i++) {
    div.innerHTML += '<i style = "background: ' + circleHue(magnitudeScale[i]) 
    + '"></i>&nbsp;' + magnitudeLabels[i] + '<br/>';
  };
  return div;
};


// Function to create overlay on tetonic plate boundaries
function createOverlay(tectonicplatesData) {

  // Create a GeoJSON layer containing the features array on the tectonicplatesData object
  var tectonic = L.geoJSON(tectonicplatesData, {

    // Update default style for polygon
    style: {
      color: "rgb(253,126,20)",
      opacity: 1,
      fill: false
    }

  })

  // Add new layer to map
  myMap.addLayer(tectonic);

  // Add tectonic plates overlay to layer control
  controlLayers.addOverlay(tectonic, "Tectonic Plates")

};