import { Injectable } from '@angular/core'
// import { Subject } from 'rxjs/subject'
import { AppConfigService } from '../config/app.config';
import { Http } from '@angular/http';

declare var google: any;
declare var MarkerClusterer: any;

@Injectable()
// Overarching service to handle Google map related method calls
export class GoogleMapService {

    map: google.maps.Map;
    markers: any;
    trafficLayer: any;
    districtLayer: any;
    countryLayer: any;
    firLayer: any;
    restrictedAirspaceLayer: any;
    runwayLayer: any;
    droneRestrictionLayer: any;
    airwayLayer: any;
    airwayData: any;

    mapStyle1 = [{ "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }, { "lightness": 13 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#08304b" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#0c4152" }, { "lightness": 5 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b434f" }, { "lightness": 25 }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b3d51" }, { "lightness": 16 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "color": "#146474" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#021019" }] }];
    mapStyle2 = [
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

    constructor(public config: AppConfigService, private http: Http) {
    };

    init(): void {
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

    }

    initGoogleMaps(): void {
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: this.config.HOME_LAT, lng: this.config.HOME_LONG },
            zoom: 6,
            styles: this.mapStyle1,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'styled_map', 'OSM']
            }
        });

        let styledMapType = new google.maps.StyledMapType(this.mapStyle2);
        styledMapType.name = "Light";
        //Associate the styled map with the MapTypeId and set it to display.
        this.map.mapTypes.set('styled_map', styledMapType);
        this.map.setMapTypeId('styled_map');

        //Define OSM map type pointing at the OpenStreetMap tile server
        this.map.mapTypes.set("OSM", new google.maps.ImageMapType({
            getTileUrl: function (coord: any, zoom: any) {
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

    }

    initLayers(): void {
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
    }

    //to load from ATSH folder
    initAirwayData(): void {
        this.airwayData = [];
        let fileDir = "../data/geojson/ATSH/";
        let fileName = "50_ATSH_data_";
        let endIdx = 72;
        let that = this;
        for (let i = 0; i <= endIdx; i++) {
            let fullFileName = fileDir + fileName + (i * 1000).toString() + ".geojson";
            this.http.get(fullFileName)
                .subscribe(
                function (res: any) {
                    let a: any = res.json();

                    // console.log(a.features);
                    for (let airway of a.features) {
                        if (that.isWithinInterestZone(airway.geometry.coordinates)) {
                            // console.log(airway.geometry.coordinates);
                            that.plotAirway(airway.geometry.coordinates);
                            that.airwayData.push(airway.geometry.coordinates);
                        }
                    }
                    // console.log("airwayData", that.airwayData.length, that.airwayData);

                }, 
                function (error) { console.log("Error happened" + error) },
                function () {
                }
                );
        }
    }

    private plotAirway(coordArr: any[]): void{
        var flightPlanCoordinates = [
            {lat: coordArr[0][1], lng: coordArr[0][0]},
            {lat: coordArr[1][1], lng: coordArr[1][0]},
          ];
          let lineStr = new google.maps.Data.LineString(flightPlanCoordinates);
          let f = new google.maps.Data.Feature();
          f.setGeometry(lineStr);
          this.airwayLayer.add(f);  
    }

    private initSampleIncidentMarkers(): void {
        let markerImage = {
            url: '../img/icons/map-marker-icon.png',
            // This marker is 20 pixels wide by 32 pixels high.
            scaledSize: new google.maps.Size(100, 100),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(50, 100)
        };

        let incidentLocations = [
            { name: "Little India", lat: 1.306348, lng: 103.849678, radius: 100 },
            { name: "Botanic Gardens", lat: 1.322168, lng: 103.814742, radius: 800 },
            { name: "City Hall", lat: 1.293149, lng: 103.852423, radius: 200 },
            { name: "NEX", lat: 1.349364, lng: 103.873732, radius: 500 },
        ];

        this.markers = [];

        for (let i of incidentLocations) {
            let incidentLoc = { lat: i.lat, lng: i.lng };
            let marker = new google.maps.Marker({
                position: incidentLoc,
                map: this.map,
                title: i.name,
                animation: google.maps.Animation.BOUNCE,
                draggable: true,
                icon: markerImage
            });
            let contentString = '<h1>' + i.name + '</h1>';
            let infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            infowindow.open(this.map, marker);
            this.markers.push(marker);

            //draw circles
            let cityCircle = new google.maps.Circle({
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
        let markerCluster = new MarkerClusterer(this.map, this.markers,
            { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

    }

    //
    private isWithinInterestZone(coordArr: any[]): boolean {
        //check if 
        let UPPER_LAT = 11.57;
        let UPPER_LON = 117.1
        let LOWER_LAT = -0.87;
        let LOWER_LON = 102.15

        if (coordArr.length === 2) {
            let coord_start = coordArr[0];
            let coord_end = coordArr[1];
            // console.log(coord_start[0], coord_start[1]);
            if (coord_start[0] < UPPER_LON && coord_start[0] > LOWER_LON && coord_start[1] < UPPER_LAT && coord_start[1] > LOWER_LAT) {
                return true;
            } else if (coord_end[0] < UPPER_LON && coord_start[0] > LOWER_LON && coord_end[1] < UPPER_LAT && coord_end[1] > LOWER_LAT) {
                //check second point
                return true;
            } else {
                return false;
            }
        } else {
            console.error("length of coordinate array is not 2", coordArr);
        }
    }

    flyTo(dest: google.maps.LatLng, zoom: number): void {
        this.map.setZoom(zoom);
        this.map.panTo(dest);
    }

    //MAP CONTROLS
    home(): void {
        console.log("home...");
        let homeCenter = new google.maps.LatLng(this.config.HOME_LAT, this.config.HOME_LONG);
        let homeZoom: number = this.config.HOME_ZOOM;
        this.flyTo(homeCenter, homeZoom);

    }


    toggleLayerVisibility(layerName: string, visibility: boolean): void {
        console.log("toggle " + layerName, visibility);
        if (layerName === "FIR") {
            this.firLayer.setMap((visibility) ? this.map : null);
        } else if (layerName === "RestrictedAirspace") {
            this.restrictedAirspaceLayer.setMap((visibility) ? this.map : null);
        }
        else if (layerName === "Runway") {
            this.runwayLayer.setMap((visibility) ? this.map : null);
        } else if (layerName === "DroneRestriction") {
            this.droneRestrictionLayer.setMap((visibility) ? this.map : null);
        }
        else if (layerName === "Airway") {
            this.airwayLayer.setMap((visibility) ? this.map : null);
        }
        else {
            console.debug("layerName mismatch");
        }
    }

    exportJson(object:any): void {
        const c = JSON.stringify(object);
        const file = new Blob([c], {type: 'text/json'});
        const fileURL = URL.createObjectURL(file);
        location.href = fileURL;
      }

    // console.log("toggleVector...test pan to bounds");
    // let southwestBound = new google.maps.LatLng(1.2559457020523277, 103.67368698120117);
    // let northeastBound = new google.maps.LatLng(1.4659998366350788, 103.97924423217773);
    // let homeBound = new google.maps.LatLngBounds(southwestBound, northeastBound);
    // this.map.panToBounds(homeBound);


}