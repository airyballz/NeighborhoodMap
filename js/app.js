
var map, bounds;
var myLocations =[]; 
var jsonBlobUrl = "https://jsonblob.com/api/";
var jsobBlobKey = "e47b31e5-1586-11e8-aee7-97af1c25fd6a";

var Location = function (data) {
  self = this;

  self.visible = ko.observable(true);
  self.position = data.location;
  self.title = data.title;
  self.street = data.street;
  self.city = data.city;
  self.zip = data.zip;

  self.infoWindow = new google.maps.InfoWindow();

  //Creates Maker
  self.marker = new google.maps.Marker({
    position: self.position,
    title: self.title,
    street: self.street,
    city: self.city,
    zip: self.zip,    
    map: map,
    animation: google.maps.Animation.DROP
  });

  // Create onclick event listener to open infowindow at each marker.
  self.marker.addListener('click', function() {
    makeInfoWindow(this, self.infoWindow);
  });
  bounds.extend(this.position);
  map.fitBounds(bounds);

  //Set Marker to Map 
  self.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

  function makeInfoWindow(marker, infoWindow) {

    // adds in animation when clicked
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } 
    else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 3600);
    }

    // check to see if infowindow is already open for this marker
    if (infoWindow.marker != marker) {
      infoWindow.marker = marker;
      infoWindow.setContent(
        '<div>' + marker.title + '</div><br/>' +      
        '<div>' + marker.street + '</div>' +
        '<div>' + marker.city + ', TX</div>' +
        '<div>' + marker.zip + '</div>'
      );
      infoWindow.open(map, marker);
    }
  }

  self.bounceMarker = function() {
    google.maps.event.trigger(this.marker, 'click');
  };

};

var ViewModel = function() {
  var self = this;

  self.filter = ko.observable("");
  self.locations = ko.observableArray([]);

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 29.9287953, lng: -95.4114391},
    zoom: 15
  });

  bounds = new google.maps.LatLngBounds();

  // Iterates through all locations provided and inputs into locations array
  myLocations.forEach(function(item){
    self.locations.push( new Location(item) );
  });

  self.filteredList = ko.computed( function() {

    var filter = self.filter().toLowerCase();

    if (!filter) {

      self.locations().forEach(function(item){
        item.visible(true);
      });
      //returns all markers is filter is blank
      return self.locations();

    } 
    else {

      //Return  myLocations based on key strokes inside input filter
      return ko.utils.arrayFilter(self.locations(), function(item) {
				var string = item.title.toLowerCase();
				var result = (string.search(filter) >= 0);
				item.visible(result);
				return result;
		  });
	  }
  });

};


//Start App 
function mapStart() {

  $.getJSON(jsonBlobUrl+jsobBlobKey)
  .done(function(d) {

      myLocations = d;
      ko.applyBindings( new ViewModel());

    })
  .fail(function() {
      alert("jsonBlob API did not load. Please try again.");
  });

}

//Start App 
function mapError() {
  alert("Google Map API did not load. Please try again.");
}
