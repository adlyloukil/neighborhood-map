var locations = [{
  category: 'Fast Food',
  title: 'Boka',
  address: '9 St Marks Pl D, New York, NY 10003, USA',
  location: {
    lat: 40.7292566,
    lng: -73.9892365
  },
  phoneNum: '+1 646-678-5796'
}, {
  category: 'Fast Food',
  title: 'Xian Famous Foods',
  address: '24 W 45th St, New York, NY 10036, USA',
  location: {
    lat: 40.7557955,
    lng: -73.9830015
  },
  phoneNum: '+1 212-786-2068'
}, {
  category: 'Fast Food',
  title: 'Shake Shack',
  address: 'Madison Square Park, Madison Ave & E.23rd St, New York, NY 10010, USA',
  location: {
    lat: 40.7449233,
    lng: -73.9973115
  },
  phoneNum: '+1 212-889-6600'
},{
  category: 'Restaurants',
  title: 'The NoMad Bar',
  address: '10 W 28th St, New York, NY 10001, USA',
  location: {
    lat: 40.7449243,
    lng: -73.9907454
  },
  phoneNum: '+1 347-472-5660'
},{
  category: 'Restaurants',
  title: 'The Nomad Hotel',
  address: '1170 Broadway, New York, NY 10001, USA',
  location: {
    lat: 40.7451979,
    lng: -73.9901083
  },
  phoneNum: '+1 347-472-5660'
}];
var map,
marker,
markers = [],
  arrayLength = locations.length;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 35.882637,
      lng: -80.081988
    },
    disableDefaultUI: true,
    zoom: 13
  });

  var bounds = new google.maps.LatLngBounds(),
    largeInfoWindow = new google.maps.InfoWindow();


  for (var i = 0; i < arrayLength; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var address = locations[i].address;
    //Setup string to make phone number easier to read
    var phoneNum = '(' + locations[i].phoneNum.slice(0, 3) + ') ' + locations[i].phoneNum.slice(3, 6) + '-' + locations[i].phoneNum.slice(6);
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      phoneNum: phoneNum,
      address: address,
      animation: google.maps.Animation.DROP,
      id: i
    });

    markers.push(marker);
    locations[i].marker = marker;
    bounds.extend(markers[i].position);

    //Animate marker, open info window, and reset center
    //when marker is clicked
    marker.addListener('click', function() {
      toggleMarkerAnimation(this);
      map.setCenter(this.position);
      populateInfoWindow(this, largeInfoWindow);
    });


  } //if
  map.fitBounds(bounds);


  google.maps.event.addDomListener(window, 'resize', function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, 'resize');
    map.setCenter(center);
  });
}


//function to animate map marker

function toggleMarkerAnimation(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
      marker.setAnimation(null);
    },2100);

}

//Gets data from yelp api and sets the infowindow content
//Yelp function based on code sample from MarkN @ Udacity

function populateInfoWindow(marker, infoWindow) {
  var YELP_KEY = 'u6NKrgh6u0TjiqusYkohKQ',
    YELP_TOKEN = 'cevD3lpYb2h29kOIOSihvrXvkwjScqU5',
    YELP_KEY_SECRET = 'DspQn3gBAv0fSGz5iCCFE0253VY',
    YELP_TOKEN_SECRET = 'xHNuuQq7ncyZGrsU43nJsI1NoYM';

  /**
   * Generates a random number and returns it as a string for OAuthentication
   * @return {string}
   */

  function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
  }

  var yelp_url = 'https://api.yelp.com/v2/phone_search/',
    yelpData,
    infoWindowContent;
  var parameters = {
    oauth_consumer_key: YELP_KEY,
    oauth_token: YELP_TOKEN,
    oauth_nonce: nonce_generate(),
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0',
    callback: 'cb', // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    phone: marker.phoneNum
  };

  //oauth library provided by Marco Bettioli
  var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
  parameters.oauth_signature = encodedSignature;

  var settings = {
    url: yelp_url,
    data: parameters,
    cache: true, // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
    dataType: 'jsonp'
  };

  // Send AJAX query via jQuery library.
  $.ajax(settings)
    .done(function(results) {
    var busNum = 0;
    //Check to make sure there is yelp data available for this business
    if (results.businesses[busNum]) {
      //check for the one case where there are two results for the same phone number
      //Use the second business in the results if true
      if (results.businesses[0].name === 'Pawn Way') {
        busNum = 1;
      }
      var loc_url,
        rating_img,
        rev_count;
      //Checks to make sure each field we use has data
      !!results.businesses[busNum].rating_img_url_small ? rating_img = results.businesses[busNum].rating_img_url_small : rating_img = 'No image available';

      !!results.businesses[busNum].review_count ? rev_count = ' (' + results.businesses[busNum].review_count + ') reviews' : rev_count = 'No reviews available';

      !!results.businesses[busNum].url ? loc_url = results.businesses[busNum].url : url = 'http://www.yelp.com';

       yelpData = '<a href="' + loc_url + '">Yelp</a>: ' + '<img src="' + rating_img + '">' + rev_count;
    } else {
      //Fills in data field if nothing is returned from Yelp
      yelpData = 'Location does not have a Yelp page.';
    }
  })
    .fail(function() {
    yelpData = 'Yelp API not available, please try again.';
    //alert('There was a problem retrieving Yelp data. Please wait a little bit and try again.');
  })
    .always(function() {
    infoWindowContent = '<div id="info-window"> Name: ' + marker.title + '<br/>' + 'Address: ' + marker.address + '<br/>' + 'Phone number: ' + marker.phoneNum + '<br/>' + yelpData + '</div>';
    infoWindow.setContent(infoWindowContent);
    infoWindow.open(map, marker);
  });

}

var viewModel = function() {

  locations.sort(function(first, second) {
    return first.title > second.title ? 1 : -1;
  });

  var self = this;

  self.categories = ko.observableArray(['All', 'Restaurants', 'Fast Food']);
  self.selectedCategory = ko.observable('All');
  self.locationsArray = ko.observableArray(locations);



  //filter list based on option selected in dropdown box
  self.filterLocations = ko.computed(function() {
    var tempArray = [];
    if (self.selectedCategory() === 'All') {
      for (var i = 0; i < arrayLength; i++) {
        tempArray.push(this.locations[i]);
        //Have to do this because this code loads before the map markers are placed
        //without this check we get a undefined error
        if (this.locations[i].marker) {
          this.locations[i].marker.setVisible(true);
        }
      }
    } else {
      for (var j = 0; j < arrayLength; j++) {
        if (self.selectedCategory() === this.locations[j].category) {
          tempArray.push(this.locations[j]);
          this.locations[j].marker.setVisible(true);
        } else {
          this.locations[j].marker.setVisible(false);
        }
      }
    }
    self.locationsArray(tempArray);


  });


  // Open info window if location is clicked in list
  this.clickLocations = function(location) {
    google.maps.event.trigger(location.marker, 'click');
  };
};

ko.applyBindings(new viewModel());

function googleMapError() {
  alert('There was a problem loading the map. Please reload the page to try again.');
}


//Use jQuery to toggle visibilty of the sidebar
//Not sure how I feel about the animation in this. Might remove.
function toggleSideBar() {
  $(".side-bar").toggle("fast");
}