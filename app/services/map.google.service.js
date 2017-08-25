"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var app_config_1 = require("../config/app.config");
var http_1 = require("@angular/http");
var GoogleMapService = (function () {
    function GoogleMapService(config, http) {
        this.config = config;
        this.http = http;
        this.mapStyle1 = [{ "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }, { "lightness": 13 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#08304b" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#0c4152" }, { "lightness": 5 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b434f" }, { "lightness": 25 }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b3d51" }, { "lightness": 16 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "color": "#146474" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#021019" }] }];
        this.mapStyle2 = [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "stylers": [
                    {
                        "color": "#cfcfcf"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "stylers": [
                    {
                        "color": "#969696"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#8a8a8a"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "water",
                "stylers": [
                    {
                        "color": "#1c354a"
                    },
                    {
                        "lightness": 5
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            }
        ];
    }
    ;
    GoogleMapService.prototype.init = function () {
        this.initGoogleMaps();
        this.initLayers();
        //click to show lat long
        // this.map.addListener('mousemove', function () {
        //     console.log("mousemove");
        //     // document.getElementById('latlon').innerHTML("clicked " + e.latLng);
        // });
        // this.map.addListener('onclick', function () {
        //     console.log("click");
        //     // document.getElementById('latlon').innerHTML("clicked " + e.latLng);
        // });
        // this.map.addListener('zoom_changed', function() {
        //     console.log("zoom:", this.map.getZoom());
        // });
    };
    GoogleMapService.prototype.initGoogleMaps = function () {
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: this.config.HOME_LAT, lng: this.config.HOME_LONG },
            zoom: 6,
            styles: this.mapStyle1,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'styled_map', 'OSM']
            }
        });
        var styledMapType = new google.maps.StyledMapType(this.mapStyle2);
        styledMapType.name = "Light";
        //Associate the styled map with the MapTypeId and set it to display.
        this.map.mapTypes.set('styled_map', styledMapType);
        this.map.setMapTypeId('styled_map');
        //Define OSM map type pointing at the OpenStreetMap tile server
        this.map.mapTypes.set("OSM", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                // "Wrap" x (logitude) at 180th meridian properly
                // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib 
                var tilesPerGlobe = 1 << zoom;
                var x = coord.x % tilesPerGlobe;
                if (x < 0) {
                    x = tilesPerGlobe + x;
                }
                // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
                return "http://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
        }));
        // this.map.setMapTypeId(new google.maps.MapTypeId('OSM'));
    };
    GoogleMapService.prototype.initLayers = function () {
        //init layers
        // this.countryLayer = new google.maps.Data();
        // this.countryLayer.loadGeoJson(this.config.SG_BOUNDARY_VECTOR_URL);
        // this.countryLayer.setStyle({
        //     strokeColor: "orange",
        //     strokeWeight: 1,
        //     visible:true
        // });
        // this.countryLayer.setMap(this.map);
        //-----FIR-----------
        this.firLayer = new google.maps.Data();
        this.firLayer.loadGeoJson(this.config.FIR_VECTOR_URL);
        this.firLayer.setStyle({
            strokeColor: "yellow",
            fillOpacity: 0.0,
            strokeWeight: 2,
            visible: true
        });
        this.firLayer.setMap(this.map);
        //-------RESTRICTED AIRSPACE-------
        this.restrictedAirspaceLayer = new google.maps.Data();
        this.restrictedAirspaceLayer.loadGeoJson(this.config.RESTRICTED_AIRSPACE_URL);
        this.restrictedAirspaceLayer.setStyle({
            strokeColor: "lightgray",
            strokeWeight: 2,
            visible: true
        });
        this.restrictedAirspaceLayer.setMap(this.map);
        //---------RUNWAYS--------------------
        this.runwayLayer = new google.maps.Data();
        this.runwayLayer.loadGeoJson(this.config.RUNWAYS_URL);
        this.runwayLayer.setStyle({
            strokeColor: "orange",
            strokeWeight: 2,
            visible: true
        });
        this.runwayLayer.setMap(this.map);
        //---------DRONE RESTRICTION--------------------
        this.droneRestrictionLayer = new google.maps.Data();
        this.droneRestrictionLayer.loadGeoJson(this.config.DRONE_RESTRICTION_URL);
        this.droneRestrictionLayer.setStyle({
            strokeColor: "red",
            strokeWeight: 2,
            visible: true
        });
        this.droneRestrictionLayer.setMap(this.map);
        //----------AIRWAY------------------------------
        this.airwayLayer = new google.maps.Data();
        this.airwayLayer.loadGeoJson(this.config.AIRWAY_URL);
        this.airwayLayer.setStyle({
            strokeColor: "green",
            strokeWeight: 2,
            visible: true
        });
        this.airwayLayer.setMap(this.map);
    };
    //to load from ATSH folder
    GoogleMapService.prototype.initAirwayData = function () {
        this.airwayData = [];
        var fileDir = "../data/geojson/ATSH/";
        var fileName = "50_ATSH_data_";
        var endIdx = 72;
        var that = this;
        for (var i = 0; i <= endIdx; i++) {
            var fullFileName = fileDir + fileName + (i * 1000).toString() + ".geojson";
            this.http.get(fullFileName)
                .subscribe(function (res) {
                var a = res.json();
                // console.log(a.features);
                for (var _i = 0, _a = a.features; _i < _a.length; _i++) {
                    var airway = _a[_i];
                    if (that.isWithinInterestZone(airway.geometry.coordinates)) {
                        // console.log(airway.geometry.coordinates);
                        that.plotAirway(airway.geometry.coordinates);
                        that.airwayData.push(airway.geometry.coordinates);
                    }
                }
                // console.log("airwayData", that.airwayData.length, that.airwayData);
            }, function (error) { console.log("Error happened" + error); }, function () {
            });
        }
    };
    GoogleMapService.prototype.plotAirway = function (coordArr) {
        var flightPlanCoordinates = [
            { lat: coordArr[0][1], lng: coordArr[0][0] },
            { lat: coordArr[1][1], lng: coordArr[1][0] },
        ];
        var lineStr = new google.maps.Data.LineString(flightPlanCoordinates);
        var f = new google.maps.Data.Feature();
        f.setGeometry(lineStr);
        this.airwayLayer.add(f);
    };
    GoogleMapService.prototype.initSampleIncidentMarkers = function () {
        var markerImage = {
            url: '../img/icons/map-marker-icon.png',
            // This marker is 20 pixels wide by 32 pixels high.
            scaledSize: new google.maps.Size(100, 100),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(50, 100)
        };
        var incidentLocations = [
            { name: "Little India", lat: 1.306348, lng: 103.849678, radius: 100 },
            { name: "Botanic Gardens", lat: 1.322168, lng: 103.814742, radius: 800 },
            { name: "City Hall", lat: 1.293149, lng: 103.852423, radius: 200 },
            { name: "NEX", lat: 1.349364, lng: 103.873732, radius: 500 },
        ];
        this.markers = [];
        for (var _i = 0, incidentLocations_1 = incidentLocations; _i < incidentLocations_1.length; _i++) {
            var i = incidentLocations_1[_i];
            var incidentLoc = { lat: i.lat, lng: i.lng };
            var marker = new google.maps.Marker({
                position: incidentLoc,
                map: this.map,
                title: i.name,
                animation: google.maps.Animation.BOUNCE,
                draggable: true,
                icon: markerImage
            });
            var contentString = '<h1>' + i.name + '</h1>';
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow.open(this.map, marker);
            this.markers.push(marker);
            //draw circles
            var cityCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: this.map,
                center: incidentLoc,
                radius: i.radius
            });
        }
        // Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(this.map, this.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
    };
    //
    GoogleMapService.prototype.isWithinInterestZone = function (coordArr) {
        //check if 
        var UPPER_LAT = 11.57;
        var UPPER_LON = 117.1;
        var LOWER_LAT = -0.87;
        var LOWER_LON = 102.15;
        if (coordArr.length === 2) {
            var coord_start = coordArr[0];
            var coord_end = coordArr[1];
            // console.log(coord_start[0], coord_start[1]);
            if (coord_start[0] < UPPER_LON && coord_start[0] > LOWER_LON && coord_start[1] < UPPER_LAT && coord_start[1] > LOWER_LAT) {
                return true;
            }
            else if (coord_end[0] < UPPER_LON && coord_start[0] > LOWER_LON && coord_end[1] < UPPER_LAT && coord_end[1] > LOWER_LAT) {
                //check second point
                return true;
            }
            else {
                return false;
            }
        }
        else {
            console.error("length of coordinate array is not 2", coordArr);
        }
    };
    GoogleMapService.prototype.flyTo = function (dest, zoom) {
        this.map.setZoom(zoom);
        this.map.panTo(dest);
    };
    //MAP CONTROLS
    GoogleMapService.prototype.home = function () {
        console.log("home...");
        var homeCenter = new google.maps.LatLng(this.config.HOME_LAT, this.config.HOME_LONG);
        var homeZoom = this.config.HOME_ZOOM;
        this.flyTo(homeCenter, homeZoom);
    };
    GoogleMapService.prototype.toggleLayerVisibility = function (layerName, visibility) {
        console.log("toggle " + layerName, visibility);
        if (layerName === "FIR") {
            this.firLayer.setMap((visibility) ? this.map : null);
        }
        else if (layerName === "RestrictedAirspace") {
            this.restrictedAirspaceLayer.setMap((visibility) ? this.map : null);
        }
        else if (layerName === "Runway") {
            this.runwayLayer.setMap((visibility) ? this.map : null);
        }
        else if (layerName === "DroneRestriction") {
            this.droneRestrictionLayer.setMap((visibility) ? this.map : null);
        }
        else if (layerName === "Airway") {
            this.airwayLayer.setMap((visibility) ? this.map : null);
        }
        else {
            console.debug("layerName mismatch");
        }
    };
    GoogleMapService.prototype.exportJson = function (object) {
        var c = JSON.stringify(object);
        var file = new Blob([c], { type: 'text/json' });
        var fileURL = URL.createObjectURL(file);
        location.href = fileURL;
    };
    return GoogleMapService;
}());
GoogleMapService = __decorate([
    core_1.Injectable()
    // Overarching service to handle Google map related method calls
    ,
    __metadata("design:paramtypes", [app_config_1.AppConfigService, typeof (_a = typeof http_1.Http !== "undefined" && http_1.Http) === "function" && _a || Object])
], GoogleMapService);
exports.GoogleMapService = GoogleMapService;
var _a;
//# sourceMappingURL=map.google.service.js.map