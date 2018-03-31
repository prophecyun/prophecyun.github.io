import { Injectable } from '@angular/core';
import { CesiumService } from '../service/cesium.service';
import { F24TrackDataService } from '../service/f24TrackData.service';
import { AppConfig } from '../config/app.config';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoadMapLayerService {

  constructor(private cesiumService: CesiumService, private appConfig: AppConfig, 
    private f24TrackDataService: F24TrackDataService,
    private http: HttpClient) {
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
      this.f24TrackDataService.updateTracks(dataSource);
    }, 5000);
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
    const fillColor: Cesium.Color = this.newColor('#f75231', 100); // Note: Modifies zone polygon
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

  private addMapMoveEndAction(cesiumViewer: Cesium.Viewer) {
    cesiumViewer.camera.moveEnd.addEventListener(() => {
      // console.log('MOVE end');
      let cartographic: any;

      // Get viewport
      const pixWidth = cesiumViewer.scene.canvas.clientWidth;
      const pixHeight = cesiumViewer.scene.canvas.clientHeight;
      // let topRight = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(pixWidth - 1, 1));
      const topLeft = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(1, 1));
      // let bottomLeft = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(1, pixHeight - 1));
      const bottomRight = cesiumViewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(pixWidth - 1, pixHeight - 1));
      if (!topLeft || !bottomRight) {
        console.warn('Failed to find viewer edge coordinates',
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

      const layerName = this.appConfig.LAYER_NAMES.airTrackLayerName;
      const dataSource = this.cesiumService.getDataSource(cesiumViewer, layerName);
      if (dataSource) {
        this.f24TrackDataService.updateTracks(dataSource);
      }
    });


    // Doesnt work
    // const rect = new Cesium.Rectangle();
    // cesiumViewer.camera.computeViewRectangle(Cesium.Ellipsoid.WGS84, rect);
    // console.log('rect', rect);
  }


  // to load from ATSH folder
  private initAirwayData(): void {
    const airwayData = [];
    const fileDir = '../data/geojson/ATSH/';
    const fileName = '50_ATSH_data_';
    const endIdx = 72;
    // let that = this;
    for (let i = 0; i <= endIdx; i += 1) {
      const fullFileName = fileDir + fileName + (i * 1000).toString() + '.geojson';
      this.http.get(fullFileName)
        .subscribe(
          (res: any) => {
            const a: any = res.json();

            // console.log(a.features);
            for (const airway of a.features) {
              if (this.isWithinInterestZone(airway.geometry.coordinates)) {
                // console.log(airway.geometry.coordinates);
                // that.plotAirway(airway.geometry.coordinates);
                airwayData.push(airway.geometry.coordinates);
              }
            }
            // console.log("airwayData", that.airwayData.length, that.airwayData);
          },
          (error) => { console.log('Error happened' + error); },
      );
    }
  }

  private isWithinInterestZone(coordArr: any[]): boolean {
    // check if 
    const UPPER_LAT = 11.57;
    const UPPER_LON = 117.1;
    const LOWER_LAT = -0.87;
    const LOWER_LON = 102.15;

    if (coordArr.length === 2) {
      const coordStart = coordArr[0];
      const coordEnd = coordArr[1];
      // console.log(coord_start[0], coord_start[1]);
      if (coordStart[0] < UPPER_LON && coordStart[0] > LOWER_LON
        && coordStart[1] < UPPER_LAT && coordStart[1] > LOWER_LAT) {
        return true;
      }
      if (coordEnd[0] < UPPER_LON && coordStart[0] > LOWER_LON
        && coordEnd[1] < UPPER_LAT && coordEnd[1] > LOWER_LAT) {
        // check second point
        return true;
      }
    } else {
      console.error('length of coordinate array is not 2', coordArr);
    }
    return false;
  }
}
