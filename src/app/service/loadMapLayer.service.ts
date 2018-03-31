import { Injectable } from '@angular/core';
import { CesiumService } from '../service/cesium.service';
import { AppConfig } from '../config/app.config';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoadMapLayerService {

  // airTrackLayerName = 'Air Track';
  // firLayerName = 'FIR';
  // airwayLayerName = 'Airway';
  // runwayLayerName = 'Runway';
  // droneRestrictionLayerName = 'Drone Restricted Zone';

  constructor(private cesiumService: CesiumService, private appConfig: AppConfig, private http: HttpClient) {
  }

  initAirTracks(cesiumViewer: Cesium.Viewer, cesiumDynamicDataSources: any[]) {
    // NEW
    // const layerName = 'Air Track';
    let dataSource = this.cesiumService.getDataSource(cesiumViewer, this.appConfig.LAYER_NAMES.airTrackLayerName);
    if (!dataSource) {
      // Need to initialize
      dataSource = this.cesiumService.createDataSource(cesiumViewer, this.appConfig.LAYER_NAMES.airTrackLayerName);
      dataSource.show = true; // Set 'dataSource.show' to true as default on create
      cesiumDynamicDataSources.push(dataSource);
    } 

    // Add action listener to map movement
    this.addMapMoveEndAction(cesiumViewer);

    // Update track position
    setInterval(() => {
      this.updateTracks(dataSource);
    }, 5000);
    
  }

  private addMapMoveEndAction(cesiumViewer: Cesium.Viewer) {
    cesiumViewer.camera.moveEnd.addEventListener(() => {
      console.log('MOVE end');
      let cartesian: any;
      let cartographic: any;
      let lonInDegrees: any;
      let latInDegrees: any;
  
      // Get viewport
      var pixWidth = cesiumViewer.scene.canvas.clientWidth;
      var pixHeight = cesiumViewer.scene.canvas.clientHeight;
      // var topRight = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(pixWidth - 1, 1));
      var topLeft = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(1, 1));
      // var bottomLeft = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(1, pixHeight - 1));
      var bottomRight = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(pixWidth - 1, pixHeight - 1));
      if (!topLeft || !bottomRight) {
        console.warn("Failed to find viewer edge coordinates",
          [topLeft, bottomRight]);
      }
  
      cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(topLeft);
      const lon1 = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
      const lat1 = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
      // console.log('top left', lat1, lon1);
  
      cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(bottomRight);
      const lon2 = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
      const lat2 = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
      // console.log('bottom right', lat2, lon2);

      this.appConfig.setBounds(lat1, lat2, lon1, lon2);

      const layerName = 'Air Track';
      let dataSource = this.cesiumService.getDataSource(cesiumViewer, layerName);
      if (dataSource) {
        this.updateTracks(dataSource);
      }      
    });


    // Doesnt work
    // const rect = new Cesium.Rectangle();
    // cesiumViewer.camera.computeViewRectangle(Cesium.Ellipsoid.WGS84, rect);
    // console.log('rect', rect);
  }

  private updateTracks(dataSource) {
    this.getTrackUpdateFromServer()
    .subscribe(data => {
      let tracks = data;
      for (let i = 0; i < Object.keys(data).length; i += 1) {
        const key = Object.keys(data)[i];
        if (key === 'full_count' || key === 'version') {
          // ignore
        } else {
          const bfPoint = tracks[key];
          this.plotTrack(dataSource, bfPoint);
        }
      }
    });
  }

  private getTrackUpdateFromServer() {
    return this.http.get(this.appConfig.F24_URL + this.appConfig.BOUNDS + this.appConfig.OPTIONS);
  }


  private plotTrack(dataSource: Cesium.DataSource, trackRaw: any) {
    if (trackRaw) {
      const track = {
        id: trackRaw[0],
        lat: trackRaw[1],
        lon: trackRaw[2],
        heading: trackRaw[3],
        alt: trackRaw[4],
        speed: trackRaw[5],
        unknown6: trackRaw[6],
        unknown7: trackRaw[7],
        aircraft: trackRaw[8],
        source: trackRaw[11],
        dest: trackRaw[12],
        callsign: trackRaw[13]
      }

      if (track.lat != null && track.lon != null) {
        // check if entity exists, if true, set entity show label value to that of previous entity
        let showLabel = true;
        let newEntity: any = dataSource.entities.getById(track.id);
        if (newEntity) {
        } else {
          newEntity = dataSource.entities.getOrCreateEntity(track.id);
        }

        newEntity.name = track.id;
        const trackRotationInRadian = (360 - track.heading) * Math.PI / 180;
        newEntity.position = new Cesium.ConstantPositionProperty(
          Cesium.Cartesian3.fromDegrees(track.lon, track.lat, 1),
        );
        newEntity.billboard = new Cesium.BillboardGraphics({
          image: new Cesium.ConstantProperty('../../assets/icons/aircraft.png'),
          height: 30,
          width: 30,
          pixelOffset: new Cesium.Cartesian2(15, 0),
          // translucencyByDistance: new Cesium.NearFarScalar(0.5e4, 1.0, 0.5e4, 0.0),
          color: Cesium.Color.BLUE,
        });
        newEntity.billboard.rotation = trackRotationInRadian;
        // Custom properties
        newEntity.type = 'Air Track'; // Used as dialog header and to identify that its a Non-Editable entity in
        // 'cesium.service'
        newEntity.data = [{
          label: 'Id',
          content: track.id,
        },
        {
          label: 'Callsign',
          content: track.callsign,
        },
        {
          label: 'Lat',
          content: track.lat,
        },
        {
          label: 'Lon',
          content: track.lon,
        },
        {
          label: 'Heading',
          content: track.heading,
        },
        {
          label: 'Speed',
          content: track.speed,
        },
        {
          label: 'Aircraft',
          content: track.aircraft,
        },
        {
          label: 'Source',
          content: track.source,
        },
        {
          label: 'Destination',
          content: track.dest,
        },
        ];
      }
    }
  }


  // Creates a new Cesium color object from the given rgba string
  private newColor(colorString: string, a: number): Cesium.Color {
    const color: Cesium.Color = Cesium.Color.fromCssColorString(colorString);
    color.alpha = a / 255;
    return color;
  }

  initLayers(cesiumViewer: Cesium.Viewer, cesiumStaticDataSources: any[]): void {
    
    this.initDroneRestrictedZoneLayer(cesiumViewer, cesiumStaticDataSources);
    this.initAirwayLayer(cesiumViewer, cesiumStaticDataSources);
    this.initRunwayLayer(cesiumViewer, cesiumStaticDataSources);
    this.initFIRLayer(cesiumViewer, cesiumStaticDataSources);
  }

  private initDroneRestrictedZoneLayer(cesiumViewer: Cesium.Viewer, cesiumStaticDataSources: any[]) {
    const layerName = this.appConfig.LAYER_NAMES.droneRestrictionLayerName;
    let dataSource = this.cesiumService.getDataSource(cesiumViewer, layerName);
    if (!dataSource) {
      dataSource = this.cesiumService.createDataSource(cesiumViewer, layerName);
      dataSource.show = true; // Set 'dataSource.show' to true as default on create
      cesiumStaticDataSources.push(dataSource);
    }

    const fillColor: Cesium.Color = this.newColor('#ffffff', 70); // Note: Modifies zone polygon
    // styling
    const strokeColor: Cesium.Color = this.newColor('#ffffff', 255); // Note: Modifies zone polygon
    // styling
    const promise = Cesium.GeoJsonDataSource.load(this.appConfig.RESTRICTED_AIRSPACE_URL,
      {
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth: 3,
        markerSymbol: '?',
      },
    );
    promise.then((loadedDataSource) => {
      if (loadedDataSource.entities) {
        const entities = loadedDataSource.entities.values;
        for (let i = 0; i < entities.length; i += 1) {
          const entity: any = entities[i];
          // console.log(entity);
          // Note: Does not use 'getOrCreateEntity' to create a new entity. It reuses/adds original
          // entity object from 'loadedDataSource'
          dataSource.entities.add(entity);
          // Note: To customise color and outline, modify the property 'entity.polygon.material'
          // and entity.polygon.outlineColor'
          entity.name = layerName + ' - ' + entity.properties['MAPTIP'];

          // Custom properties
          entity.type = layerName; // Used as dialog header and to identify that its a Non-Editable
          // entity in 'cesium.service'
          entity.data = [
            {
              label: 'Zone Name',
              content: entity.properties['MAPTIP'],
            },
            {
              label: 'Description',
              content: entity.properties['DESCRIPTIO'],
            },
          ];
        }
      }
    }, (errorMsg) => {
      console.log(errorMsg); // Error!
    });
  }

  private initAirwayLayer(cesiumViewer: Cesium.Viewer, cesiumStaticDataSources: any[]) {
    const layerName = this.appConfig.LAYER_NAMES.airwayLayerName;
    let dataSource = this.cesiumService.getDataSource(cesiumViewer, layerName);
    if (!dataSource) {
      dataSource = this.cesiumService.createDataSource(cesiumViewer, layerName);
      dataSource.show = false; // Set 'dataSource.show' to true as default on create
      cesiumStaticDataSources.push(dataSource);
    }

    // const fillColor: Cesium.Color = this.newColor('#ffffff', 70); // Note: Modifies zone polygon
    // styling
    const strokeColor: Cesium.Color = this.newColor('#f427c8', 255); // Note: Modifies zone polygon
    // styling
    const promise = Cesium.GeoJsonDataSource.load(this.appConfig.AIRWAY_URL,
      {
        stroke: strokeColor,
        // fill: fillColor,
        strokeWidth: 1,
        markerSymbol: '?',
      },
    );
    promise.then((loadedDataSource) => {
      if (loadedDataSource.entities) {
        const entities = loadedDataSource.entities.values;
        for (let i = 0; i < entities.length; i += 1) {
          const entity: any = entities[i];
          // console.log(entity);
          // Note: Does not use 'getOrCreateEntity' to create a new entity. It reuses/adds original
          // entity object from 'loadedDataSource'
          dataSource.entities.add(entity);
          // Note: To customise color and outline, modify the property 'entity.polygon.material'
          // and entity.polygon.outlineColor'
          entity.name = layerName + ' - ' + i;

          // Custom properties
          entity.type = layerName; // Used as dialog header and to identify that its a Non-Editable
          // entity in 'cesium.service'
          entity.data = [];
        }
      }
    }, (errorMsg) => {
      console.log(errorMsg); // Error!
    });
  }

  private initFIRLayer(cesiumViewer: Cesium.Viewer, cesiumStaticDataSources: any[]) {
    const layerName = this.appConfig.LAYER_NAMES.firLayerName;
    let dataSource = this.cesiumService.getDataSource(cesiumViewer, layerName);
    if (!dataSource) {
      dataSource = this.cesiumService.createDataSource(cesiumViewer, layerName);
      dataSource.show = true; // Set 'dataSource.show' to true as default on create
      cesiumStaticDataSources.push(dataSource);
    }
    const fillColor: Cesium.Color = this.newColor('#ffffff', 1); // Note: Modifies zone polygon
    // styling
    const strokeColor: Cesium.Color = this.newColor('#f4c842', 255); // Note: Modifies zone polygon
    // styling
    const promise = Cesium.GeoJsonDataSource.load(this.appConfig.FIR_VECTOR_URL,
      {
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth: 6,
        markerSymbol: '?',
      },
    );
    promise.then((loadedDataSource) => {
      if (loadedDataSource.entities) {
        const entities = loadedDataSource.entities.values;
        for (let i = 0; i < entities.length; i += 1) {
          const entity: any = entities[i];
          
          // console.log(entity);
          // Note: Does not use 'getOrCreateEntity' to create a new entity. It reuses/adds original
          // entity object from 'loadedDataSource'
          dataSource.entities.add(entity);
          // Note: To customise color and outline, modify the property 'entity.polygon.material'
          // and entity.polygon.outlineColor'
          entity.name = layerName + ' - ' + i;

          // Custom properties
          entity.type = layerName; // Used as dialog header and to identify that its a Non-Editable
          // entity in 'cesium.service'
          entity.data = [
            {
              label: 'FIR Name',
              content: entity.properties['FIRname'],
            },
            {
              label: 'ICAO Code',
              content: entity.properties['ICAOCODE'],
            },
            {
              label: 'Area',
              content: entity.properties['AREA'],
            },
            {
              label: 'Perimeter',
              content: entity.properties['PERIMETER'],
            },
          ];
        }
      }
    }, (errorMsg) => {
      console.log(errorMsg); // Error!
    });
  }

  private initRunwayLayer(cesiumViewer: Cesium.Viewer, cesiumStaticDataSources: any[]) {
    const layerName = this.appConfig.LAYER_NAMES.runwayLayerName;
    let dataSource = this.cesiumService.getDataSource(cesiumViewer, layerName);
    if (!dataSource) {
      dataSource = this.cesiumService.createDataSource(cesiumViewer, layerName);
      dataSource.show = true; // Set 'dataSource.show' to true as default on create
      cesiumStaticDataSources.push(dataSource);
    }
    const fillColor: Cesium.Color = this.newColor('#ffffff', 0); // Note: Modifies zone polygon
    // styling
    const strokeColor: Cesium.Color = this.newColor('#f75231', 255); // Note: Modifies zone polygon
    // styling
    const promise = Cesium.GeoJsonDataSource.load(this.appConfig.RUNWAYS_URL,
      {
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth: 3,
        markerSymbol: '?',
      },
    );
    promise.then((loadedDataSource) => {
      if (loadedDataSource.entities) {
        const entities = loadedDataSource.entities.values;
        for (let i = 0; i < entities.length; i += 1) {
          const entity: any = entities[i];
          // console.log(entity);
          // Note: Does not use 'getOrCreateEntity' to create a new entity. It reuses/adds original
          // entity object from 'loadedDataSource'
          dataSource.entities.add(entity);
          // Note: To customise color and outline, modify the property 'entity.polygon.material'
          // and entity.polygon.outlineColor'
          entity.name = layerName + ' - ' + i;

          // Custom properties
          entity.type = layerName; // Used as dialog header and to identify that its a Non-Editable
          // entity in 'cesium.service'
          entity.data = [
            {
              label: 'Airport',
              content: entity.properties['ARPT_IDENT'],
            },
            {
              label: 'Runway Name',
              content: entity.properties['RWY'],
            },
            {
              label: 'Runway Width',
              content: entity.properties['RWY_WIDTH'],
            },
          ];
        }
      }
    }, (errorMsg) => {
      console.log(errorMsg); // Error!
    });
  }

  //to load from ATSH folder
  private initAirwayData(): void {
    let airwayData = [];
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
                // that.plotAirway(airway.geometry.coordinates);
                airwayData.push(airway.geometry.coordinates);
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
}
