import React, {Component} from 'react';
import LocationList from './LocationList';

class App extends Component {

    /* Constructor */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {'name': "Taj Restaurant",
                    'type': "Restaurant",
                    'latitude': 26.906970,
                    'longitude': 75.743848,
                    'streetAddress': "18th Street, Gautam Marg, India"},
                {'name': "PVR Cinemas",
                    'type': "Movie Theater",
                    'latitude': 26.912831,
                    'longitude': 75.748389,
                    'streetAddress': "B-19, Vaibhav Complex, India"},
                {'name': "DTDC Courier",
                    'type': "Courier Service",
                    'latitude': 26.911203,
                    'longitude': 75.738678,
                    'streetAddress': "A5/19, Vaishali Tower, India"},
                {'name': "Hotel Seven Stars",
                    'type': "5 Star Hotel",
                    'latitude': 26.906269,
                    'longitude': 75.739383,
                    'streetAddress': "A-63, Nemi Nagar, Gandhi Path, India"},
                {'name': "ICICI ATM",
                    'type': "Bank ATM",
                    'latitude': 26.913079,
                    'longitude': 75.743407,
                    'streetAddress': "D-15, Lalarpura Road, Gandhi Path, India"}
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        window.initMap = this.initMap;
        renderMap('https://maps.googleapis.com/maps/api/js?key=AIzaSyDmBX4fqHFXTqmpHKiyEHAaOjGtLu5GMz8&callback=initMap')
    }

    /* Initialising the map once the google map's script is loaded */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 26.91151, lng: 75.743943},
            zoom: 16,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /* Open InfoWindow for the marker */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /* Retrive location data from Foursquare API for the marker */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "BZCROBZUFKFKQJMWYUXFN3W1FU2XE1BXWDH2IK4H5FN5QVZN";
        var clientSecret = "A13MPN2TITHLTNTSUN5I5EBINC1L0YKTSH05R05WYZVE4FGC";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can not be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can not be loaded");
            });
    }

    /* Close the InfoWindow for the marker */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /* Render function of App */
    render() {
        return (
            <div>
                <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map" role="application" aria-label="map"></div>
            </div>
        );
    }
}

export default App;

/* Load the google maps Asynchronously */
function renderMap(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    window.gm_authFailure = () => {
        document.write("Google Maps API Authorization Failure");
    };
    script.onerror = function () {
        document.write("Google Maps can not be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}
