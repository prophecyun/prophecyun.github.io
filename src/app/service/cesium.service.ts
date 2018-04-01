import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AppConfig } from '../config/app.config';
import { F24TrackDataService } from './f24TrackData.service';
import * as moment from 'moment';

@Injectable()
export class CesiumService {
  private geofenceSubject = new Subject<any>();

  constructor(private appConfig: AppConfig, private f24TrackDataService: F24TrackDataService) {
  }

  initCesiumViewer(cesiumMapContainerId: string, cesiumCreditContainerId: string) {
    const cesiumViewer = new Cesium.Viewer(
      cesiumMapContainerId, // Important: id of HTML container to display the map
      {
        // baseLayerPicker: false, // Top right button
        // sceneModePicker: false, // Top right button
        // scene3DOnly: false, // Top right button
        homeButton: false, // Top right button
        // geocoder: false, // Top right button
        timeline: false, // Bottom 'Timeline'
        animation: false, // Bottom left corner time widget
        infoBox: false, // Top right dynamic infoBox
        selectionIndicator: false, // Mouse click selection box
        fullscreenButton: false, // Bottom right button
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        contextOptions: {
          webgl: { preserveDrawingBuffer: true },
        },
        creditContainer: cesiumCreditContainerId, // To remove bottom right Cesium logo
      },
    );

    /** ----- Cesium Camera Settings ----- **/
    /* Set to 2d map */
    cesiumViewer.scene.morphTo2D(0); // Note: 2D mode will cause clustered labels to look blurry

    /* Set Camera view */
    // Singapore Overview: const lon = 103.819775, lat = 1.3598951, height = 55000;
    // Marina Bay Floating Platform: const lon = 103.85909039, lat = 1.28875506, height =
    // 1023.5741153041954;
    const lon = 103.85909039;
    const lat = 1.28875506;
    const height = 1000000;
    cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      heading: 0,
      pitch: -Cesium.Math.PI_OVER_TWO,
      roll: 0.0,
    });

    /* Remove zoom to entity */
    cesiumViewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    /* Remove CameraEventType.RIGHT_DRAG for zooming in by forcing zoom in on 'Cesium.CameraEventType.WHEEL' only */
    cesiumViewer.scene.screenSpaceCameraController.zoomEventTypes = Cesium.CameraEventType.WHEEL;


    /* Add Default ScreenSpaceEventHandlers */
    // this.addDefaultRightClickInputAction(cesiumViewer);
    this.addDefaultMouseMoveInputAction(cesiumViewer);


    return cesiumViewer;
  }

  initCesiumDrawingTools(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsContainerId: string,
    cesiumDrawingToolsProperties: any) {
    const drawingToolsContainerDiv = document.getElementById(cesiumDrawingToolsContainerId);
    if (drawingToolsContainerDiv) {
      this.addLeftClickEntityPickerInputAction(cesiumViewer, cesiumDrawingToolsProperties);
      const drawingToolsHandler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);
      cesiumDrawingToolsProperties.drawingToolsHandler = drawingToolsHandler;
      for (let i = 0; i < cesiumDrawingToolsProperties.drawingTools.length; i += 1) {
        const drawingTool = cesiumDrawingToolsProperties.drawingTools[i];
        if (drawingTool.type === 'draw-marker') {
          this.initDrawMarkerButtonFunctions(cesiumViewer, cesiumDrawingToolsProperties, drawingTool);
        } else if (drawingTool.type === 'draw-polyline') {
          this.initDrawPolylineButtonFunctions(cesiumViewer, cesiumDrawingToolsProperties, drawingTool);
        } else if (drawingTool.type === 'draw-polygon') {
          this.initDrawPolygonButtonFunctions(cesiumViewer, cesiumDrawingToolsProperties, drawingTool);
        } else if (drawingTool.type === 'draw-circle') {
          this.initDrawCircleButtonFunctions(cesiumViewer, cesiumDrawingToolsProperties, drawingTool);
        } else if (drawingTool.type === 'draw-scribble') {
          this.initDrawScribbleButtonFunctions(cesiumViewer, cesiumDrawingToolsProperties, drawingTool);
        }
      }
    }
  }

  registerDataSource(cesiumViewer: Cesium.Viewer, dataSource: Cesium.GeoJsonDataSource, dataSourceName: string) {
    const dataSourceOld = this.getDataSource(cesiumViewer, dataSourceName);
    if (dataSourceOld) {
      cesiumViewer.dataSources.remove(dataSourceOld, true);
    }
    dataSource.name = dataSourceName;
    dataSource.show = true;
    cesiumViewer.dataSources.add(dataSource);
  }

  createDataSource(cesiumViewer: Cesium.Viewer, dataSourceName: string) {
    let newDataSourceName = dataSourceName;
    for (let i = 0; i < cesiumViewer.dataSources.length; i += 1) {
      const dataSource = cesiumViewer.dataSources.get(i);
      if (dataSource.name === dataSourceName) {
        newDataSourceName = newDataSourceName + ' - Copy';
      }
    }

    const newDataSource = new Cesium.GeoJsonDataSource(newDataSourceName);
    cesiumViewer.dataSources.add(newDataSource);
    return newDataSource;
  }

  getDataSource(cesiumViewer: Cesium.Viewer, dataSourceName: string) {
    for (let i = 0; i < cesiumViewer.dataSources.length; i += 1) {
      const dataSource = cesiumViewer.dataSources.get(i);
      if (dataSource.name === dataSourceName) {
        return dataSource;
      }
    }
    return null;
  }


  resetDrawingToolsButtons(cesiumDrawingToolsProperties: any, activeDrawingTool: any) {
    for (let i = 0; i < cesiumDrawingToolsProperties.drawingTools.length; i += 1) {
      const drawingTool = cesiumDrawingToolsProperties.drawingTools[i];
      if (drawingTool !== activeDrawingTool) {
        drawingTool.isActivated = false;
      }
    }
    const drawingToolsHandler = cesiumDrawingToolsProperties.drawingToolsHandler;
    drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  saveCanvasAsImage(cesiumViewer: Cesium.Viewer) {
    if (cesiumViewer && cesiumViewer.scene) {
      cesiumViewer.scene.canvas.toBlob((blob) => {
        const objUrl = URL.createObjectURL(blob);
        const link = <HTMLAnchorElement>document.createElement('a');
        link.download = 'map-download.png';
        link.href = objUrl;
        document.body.appendChild(link);
        link.click();  // Mimic click on "download button"
        document.body.removeChild(link);
      });
    }
  }

  exportDataSourceAsGeoJson(dataSource: Cesium.DataSource) {
    const geojsonStr = this.convertDataSourceToGeoJson(dataSource);
    const encodedJsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(geojsonStr);
    const link = <HTMLAnchorElement>document.createElement('a');
    link.download = 'layer-download.geojson';
    link.href = encodedJsonString;
    document.body.appendChild(link);
    link.click();  // Mimic click on "download button"
    document.body.removeChild(link);
  }

  updateEntityIcon(cesiumDrawingToolsProperties: any) {
    if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.billboard)) {
      cesiumDrawingToolsProperties.pickedEntity.billboard.image =
        new Cesium.ConstantProperty(cesiumDrawingToolsProperties.selectedIcon);
    }
  }

  updateEntityColor(cesiumDrawingToolsProperties: any) {
    if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.billboard)) {
      cesiumDrawingToolsProperties.pickedEntity.billboard.color =
        Cesium.Color.fromCssColorString(cesiumDrawingToolsProperties.selectedColor);
    } else if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.polyline)) {
      cesiumDrawingToolsProperties.pickedEntity.polyline.material.color =
        Cesium.Color.fromCssColorString(cesiumDrawingToolsProperties.selectedColor);
    } else if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.polygon)) {
      cesiumDrawingToolsProperties.pickedEntity.polygon.material.color =
        Cesium.Color.fromCssColorString(cesiumDrawingToolsProperties.selectedColor);
      cesiumDrawingToolsProperties.pickedEntity.polygon.material.color._value.alpha =
        (cesiumDrawingToolsProperties.selectedColorAlpha / 10);
    } else if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.ellipse)) {
      cesiumDrawingToolsProperties.pickedEntity.ellipse.material.color =
        Cesium.Color.fromCssColorString(cesiumDrawingToolsProperties.selectedColor);
      cesiumDrawingToolsProperties.pickedEntity.ellipse.material.color._value.alpha =
        (cesiumDrawingToolsProperties.selectedColorAlpha / 10);
    }
  }

  setCameraView(cesiumViewer: Cesium.Viewer, location: any) {
    cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(location.lonInDegrees, location.latInDegrees, location.heightInMeters),
      heading: 0,
      pitch: -Cesium.Math.PI_OVER_TWO,
      roll: 0.0,
    });
  }

  addGeofenceHandler(cesiumViewer: Cesium.Viewer, dataSource: Cesium.DataSource, rectangleGraphicsOptions: any) {
    const geofenceEntityId = 'geofence';
    let startCartographic: any;
    let endCartographic: any;
    let currCartographic: any;
    let isRightDown = false;

    let west;
    let south;
    let east;
    let north;

    const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);
    handler.setInputAction((click: any) => {
      isRightDown = true;

      const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
      const cartesian: any = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
      startCartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      endCartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

      if (startCartographic && endCartographic) {
        const startLonInDegrees: number = Cesium.Math.toDegrees(startCartographic.longitude);
        const startLatInDegrees: number = Cesium.Math.toDegrees(startCartographic.latitude);
        const endLonInDegrees: number = Cesium.Math.toDegrees(endCartographic.longitude);
        const endLatInDegrees: number = Cesium.Math.toDegrees(endCartographic.latitude);

        west = startLonInDegrees > endLonInDegrees ? endLonInDegrees : startLonInDegrees;
        south = startLatInDegrees > endLatInDegrees ? endLatInDegrees : startLatInDegrees;
        east = startLonInDegrees < endLonInDegrees ? endLonInDegrees : startLonInDegrees;
        north = startLatInDegrees < endLatInDegrees ? endLatInDegrees : startLatInDegrees;

        const entity: Cesium.Entity = dataSource.entities.getOrCreateEntity(geofenceEntityId);
        entity.rectangle = new Cesium.RectangleGraphics(rectangleGraphicsOptions);
        entity.rectangle.coordinates = new Cesium.CallbackProperty(() => {
          return Cesium.Rectangle.fromDegrees(west, south, east, north);
        }, false);
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    handler.setInputAction((click: any) => {
      isRightDown = false;

      const westConfirmed = Object.assign(west);
      const southConfirmed = Object.assign(south);
      const eastConfirmed = Object.assign(east);
      const northConfirmed = Object.assign(north);

      const entity: Cesium.Entity = dataSource.entities.getById(geofenceEntityId);
      entity.rectangle.coordinates = new Cesium.ConstantProperty(
        Cesium.Rectangle.fromDegrees(westConfirmed, southConfirmed, eastConfirmed, northConfirmed));

      // this.updateGeofenceEntity(entity);

    }, Cesium.ScreenSpaceEventType.RIGHT_UP);

    handler.setInputAction((movement: any) => {
      if (isRightDown) {
        const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
        const cartesian: any = cesiumViewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        currCartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

        if (startCartographic && currCartographic) {
          const startLonInDegrees: number = Cesium.Math.toDegrees(startCartographic.longitude);
          const startLatInDegrees: number = Cesium.Math.toDegrees(startCartographic.latitude);
          const currLonInDegrees: number = Cesium.Math.toDegrees(currCartographic.longitude);
          const currLatInDegrees: number = Cesium.Math.toDegrees(currCartographic.latitude);

          west = startLonInDegrees > currLonInDegrees ? currLonInDegrees : startLonInDegrees;
          south = startLatInDegrees > currLatInDegrees ? currLatInDegrees : startLatInDegrees;
          east = startLonInDegrees < currLonInDegrees ? currLonInDegrees : startLonInDegrees;
          north = startLatInDegrees < currLatInDegrees ? currLatInDegrees : startLatInDegrees;
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // handler.setInputAction((movement: any) => {
    //   const entity: Cesium.Entity = dataSource.entities.getById(geofenceEntityId);
    //   if (entity) {
    //     dataSource.entities.removeById(entity.id);
    //   }
    // }, Cesium.ScreenSpaceEventType.RIGHT_DOUBLE_CLICK);
  }

  updateGeofenceEntity(geofenceEntity: any) {
    this.geofenceSubject.next(geofenceEntity); // To update geofenceEntity for components that uses
    // geofence and have subscribe to its service
  }

  getGeofenceEntityAsObservable(): Observable<any> {
    return this.geofenceSubject.asObservable();
  }

  private addLeftClickEntityPickerInputAction(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties: any) {
    cesiumViewer.screenSpaceEventHandler.setInputAction((click: any) => {

      const ellipsoid = cesiumViewer.scene.globe.ellipsoid;
      const cartesian = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
      const windowXYPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(cesiumViewer.scene, cartesian);
      // const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      // const lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude);
      // const latInDegrees = Cesium.Math.toDegrees(cartographic.latitude);

      // const pickedEntity = cesiumViewer.scene.pick(click.position);
      const pickedObjs = cesiumViewer.scene.drillPick(click.position);
      // console.log('drill picked', pickedObjs);
      const pickedEntity = this.prioritizePicks(pickedObjs);


      if (Cesium.defined(pickedEntity) && pickedEntity.id && pickedEntity.id.id) {
        cesiumDrawingToolsProperties.pickedEntity = this.getEntity(cesiumViewer, pickedEntity.id.id);

        // NON-EDITABLE ENTITY // TODO: Change static datasource/layer names to get from app.config
        if (cesiumDrawingToolsProperties.pickedEntity.type
          && this.appConfig.isNonEditableEntity(cesiumDrawingToolsProperties.pickedEntity.type)
        ) {
          console.log('PICKED - Non-Editable: ', cesiumDrawingToolsProperties.pickedEntity.type);
          cesiumDrawingToolsProperties.pickedEntityEditable = false;

          // Handle Track Selection
          this.handleTrackSelection(cesiumViewer, cesiumDrawingToolsProperties);

        } else { // EDITABLE ENTITY
          console.log('PICKED - Editable: ', cesiumDrawingToolsProperties.pickedEntity.id);
          this.handleEditableEntity(cesiumViewer, pickedEntity, cesiumDrawingToolsProperties);
        }

        // Initialise dialog position based on entity position
        this.initContextDialog(cesiumViewer, windowXYPosition, cesiumDrawingToolsProperties);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  private handleTrackSelection(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties) {
    const dataSource = this.getDataSource(cesiumViewer, this.appConfig.LAYER_NAMES.airTrackLayerName);
    if (cesiumDrawingToolsProperties.pickedEntity.type === this.appConfig.LAYER_NAMES.airTrackLayerName) {
      // console.log('picked air track', cesiumDrawingToolsProperties.pickedEntity.data[0]);
      if (cesiumDrawingToolsProperties.pickedEntity.data[0]) {
        const f24Id = cesiumDrawingToolsProperties.pickedEntity.data[0]['content'];
        this.f24TrackDataService.handleSelectedTrack(dataSource, f24Id);
      }
    } else { // Did not select track
      this.f24TrackDataService.removeTrail(dataSource);
    }
  }

  private initContextDialog(cesiumViewer: Cesium.Viewer,
    windowXYPosition: Cesium.Cartesian2, cesiumDrawingToolsProperties) {

    // cesiumDrawingToolsProperties.displayEntityDetailsDialog_xPos = windowXYPosition.x + 10;
    // cesiumDrawingToolsProperties.displayEntityDetailsDialog_yPos = windowXYPosition.y + 10;
    // cesiumDrawingToolsProperties.displayEntityDetailsDialog_xPos = 100;
    // cesiumDrawingToolsProperties.displayEntityDetailsDialog_yPos = 100;
    if (cesiumDrawingToolsProperties.displayEntityDetailsDialog) {
      // cesiumDrawingToolsProperties.displayEntityDetailsDialog = false;
      // setTimeout(() => {
      //   cesiumDrawingToolsProperties.displayEntityDetailsDialog = true;
      // }, 100);
    } else {
      cesiumDrawingToolsProperties.displayEntityDetailsDialog = true;
    }
  }

  private handleEditableEntity(cesiumViewer: Cesium.Viewer, pickedEntity, cesiumDrawingToolsProperties) {
    cesiumDrawingToolsProperties.pickedEntityEditable = true;

    // Default properties
    let entityColor;
    let entityColorAlpha = 1; // Default
    cesiumDrawingToolsProperties.displayEntityDetailsActions = [
      {
        type: 'media',
        title: 'Add image or video',
        isActivated: false,
        iconUrl: '../../assets/icons/solid/camera-white.svg',
        function: (event, overlayPanel) => {
          const fileUploadElement = document.getElementById('file-upload');
          if (fileUploadElement) {
            fileUploadElement.click();
          }
        },
      },
      {
        type: 'delete',
        title: 'Delete Entity',
        isActivated: false,
        iconUrl: '../../assets/icons/solid/trash-alt-white.svg',
        function: () => {
          const dataSource = this.getEntityDataSourceFromEntityId(cesiumViewer, pickedEntity.id.id);
          dataSource.entities.removeById(cesiumDrawingToolsProperties.pickedEntity.id);
          cesiumDrawingToolsProperties.displayEntityDetailsDialog = false;
        },
      },
    ];

    // Billboard (Marker)
    if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.billboard)) {
      // Initialise 'entityColor'
      entityColor = cesiumDrawingToolsProperties.pickedEntity.billboard.color.getValue(null);

      // Push additional actions for billboard entities
      cesiumDrawingToolsProperties.displayEntityDetailsActions.unshift(
        {
          type: 'icon',
          title: 'Icon',
          isActivated: false,
          iconUrl: '../../assets/icons/solid/map-marker-alt-white.svg',
          function: (event, overlayPanel, action?) => {
            overlayPanel.toggle(event, event.target);
          },
        },
      );

      // Polyline + Scribble
    } else if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.polyline)) {
      // Initialise 'entityColor'
      entityColor = cesiumDrawingToolsProperties.pickedEntity.polyline.material.color.getValue(null);

      // Push additional actions for polyline entities
      cesiumDrawingToolsProperties.displayEntityDetailsActions.unshift(
        {
          type: 'arrowhead',
          title: 'Add/Remove Arrowhead',
          isActivated: false,
          iconUrl: '../../assets/icons/solid/arrow-right-white.svg',
          function: (event, overlayPanel, action?) => {
            if (action) {
              action.isActivated = !action.isActivated;
              const currentEntityColor = cesiumDrawingToolsProperties.pickedEntity.polyline.material.color
                .getValue(null);
              if (action.isActivated === true) {
                cesiumDrawingToolsProperties.pickedEntity.polyline.material =
                  new Cesium.PolylineArrowMaterialProperty(currentEntityColor);
                cesiumDrawingToolsProperties.pickedEntity.polyline.width =
                  cesiumDrawingToolsProperties.pickedEntity.polyline.width + 10;
              } else {
                cesiumDrawingToolsProperties.pickedEntity.polyline.material = currentEntityColor;
                cesiumDrawingToolsProperties.pickedEntity.polyline.width =
                  cesiumDrawingToolsProperties.pickedEntity.polyline.width - 10;
                if (cesiumDrawingToolsProperties.pickedEntity.polyline.width <= 0) {
                  cesiumDrawingToolsProperties.pickedEntity.polyline.width = 1;
                }
              }
            }
          },
        },
      );
      cesiumDrawingToolsProperties.displayEntityDetailsActions.unshift(
        {
          type: 'width',
          title: 'Line Width',
          isActivated: false,
          iconUrl: '../../assets/icons/solid/line-width.svg',
          function: (event, overlayPanel, action?) => {
            overlayPanel.toggle(event, event.target);
          },
        },
      );
      // Polygon (Note: Has additional color property - alpha)
    } else if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.polygon)) {
      // Initialise 'entityColor' & 'entityColorAlpha'
      entityColor = cesiumDrawingToolsProperties.pickedEntity.polygon.material.color.getValue(null);
      entityColorAlpha = entityColor.alpha;

      // Push additional actions for polygon entities
      cesiumDrawingToolsProperties.displayEntityDetailsActions.unshift(
        {
          type: 'alpha',
          title: 'Transparency',
          isActivated: false,
          iconUrl: '../../assets/icons/solid/transparency.svg',
          function: (event, overlayPanel, action?) => {
            overlayPanel.toggle(event, event.target);
          },
        },
      );
      // Ellipse (Circle) (Note: Has additional color property - alpha)
    } else if (Cesium.defined(cesiumDrawingToolsProperties.pickedEntity.ellipse)) {
      // Initialise 'entityColor' & 'entityColorAlpha'
      entityColor = cesiumDrawingToolsProperties.pickedEntity.ellipse.material.color.getValue(null);
      entityColorAlpha = entityColor.alpha;

      // Push additional actions for ellipse entities
      cesiumDrawingToolsProperties.displayEntityDetailsActions.unshift(
        {
          type: 'alpha',
          title: 'Transparency',
          isActivated: false,
          iconUrl: '../../assets/icons/solid/transparency.svg',
          function: (event, overlayPanel, action?) => {
            overlayPanel.toggle(event, event.target);
          },
        },
      );
    }

    // Initialise entity color
    if (entityColor) {
      const entityColorRed = Cesium.Color.floatToByte(entityColor.red);
      const entityColorGreen = Cesium.Color.floatToByte(entityColor.green);
      const entityColorBlue = Cesium.Color.floatToByte(entityColor.blue);
      cesiumDrawingToolsProperties.selectedColor =
        this.rgbToHex(entityColorRed, entityColorGreen, entityColorBlue);
      cesiumDrawingToolsProperties.selectedColorAlpha = (entityColorAlpha * 10); // Note:
      // Convert
      // to 1-10
      // due to
      // slider
      // not
      // able to
      // set
      // decimal
      // steps
    }
  }

  private componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  private rgbToHex(r, g, b) {
    return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  private getEntityDataSourceFromEntityId(cesiumViewer: Cesium.Viewer, entityId: string) {
    for (let i = 0; i < cesiumViewer.dataSources.length; i += 1) {
      const entity = cesiumViewer.dataSources.get(i).entities.getById(entityId);
      if (entity != null) {
        return cesiumViewer.dataSources.get(i);
      }
    }
  }

  private prioritizePicks(pickedObjects): any {
    // console.log('candidates', pickedObjects);
    // for (let i = 0; i < pickedObjects.length; i += 1) {
    let bestScore = -1;
    let chosen;
    pickedObjects.forEach((element) => {
      const layerName = element.id.type;
      const score = this.getScore(layerName);
      // console.log('candidate', layerName, score);
      if (score > bestScore) {
        chosen = element;
        bestScore = score;
      }
    });
    return chosen;
  }

  private getScore(layerName: string) : number {
    switch (layerName) {
      case this.appConfig.LAYER_NAMES.airTrackLayerName: {
        return 4;
      }
      case this.appConfig.LAYER_NAMES.runwayLayerName: {
        return 3;
      }
      case this.appConfig.LAYER_NAMES.airwayLayerName: {
        return 2;
      }
      case this.appConfig.LAYER_NAMES.droneRestrictionLayerName: {
        return 1;
      }
      case this.appConfig.LAYER_NAMES.firLayerName: {
        return 0;
      }
    }
  }

  private getEntity(cesiumViewer: Cesium.Viewer, entityId: string) {
    for (let i = 0; i < cesiumViewer.dataSources.length; i += 1) {
      const entity = cesiumViewer.dataSources.get(i).entities.getById(entityId);
      if (entity != null) {
        // console.log('picked entity', entity, cesiumViewer.dataSources.get(i).name);
        return entity;
      }
    }
  }

  private initDrawMarkerButtonFunctions(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties: any,
    drawingTool: any) {
    const drawMarkerButton = document.getElementById(drawingTool.id);
    drawMarkerButton.addEventListener('click', () => {
      drawingTool.isActivated = !drawingTool.isActivated;
      const drawingToolsHandler = cesiumDrawingToolsProperties.drawingToolsHandler;
      if (drawingTool.isActivated) {
        // Reset/de-activate all other drawing tools
        this.resetDrawingToolsButtons(cesiumDrawingToolsProperties, drawingTool);
        // Add LEFT_DOUBLE_CLICK action to start drawing marker
        drawingToolsHandler.setInputAction((click: any) => {
          const pickedEntity = cesiumViewer.scene.pick(click.position);
          if (!pickedEntity) {
            // Get 'lonInDegrees' & 'latInDegrees' from 'click.position'
            const ellipsoid = cesiumViewer.scene.globe.ellipsoid;
            const cartesian = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude);
            const latInDegrees = Cesium.Math.toDegrees(cartographic.latitude);
            const heightInMetres = 0;

            // Initialise entity id
            cesiumDrawingToolsProperties.totalEntityCount += 1;
            const entityId = 'marker-' + (cesiumDrawingToolsProperties.totalEntityCount);
            const currDateTimestamp = moment(new Date()).format('YYYYMMDD-hhmmss');
            const dataSourceEntityId = cesiumDrawingToolsProperties.activeDataSource.name + ' - ' + entityId + ' - ' +
              '[' + currDateTimestamp + ']';

            // Draw marker entity (billboard)
            const entity: Cesium.Entity = cesiumDrawingToolsProperties.activeDataSource.entities.getOrCreateEntity(
              dataSourceEntityId);
            entity.name = entityId;
            entity.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(lonInDegrees, latInDegrees, heightInMetres));
            entity.billboard = new Cesium.BillboardGraphics({
              image: new Cesium.ConstantProperty('../../assets/markers/marker-white.png'), // Note:
              // Marker
              // color
              // can
              // be
              // easily
              // updated
              // using
              // 'color'
              // property
              height: 40,
              width: 40,
              color: Cesium.Color.RED,
            });

            // Add entity label
            entity.label = new Cesium.LabelGraphics({
              text: new Cesium.ConstantProperty(entity.name),
              font: '12pt Lucida Sans',
              style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.LEFT),
              verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.CENTER),
              eyeOffset: new Cesium.Cartesian3(0, 0, -1),
              pixelOffset: new Cesium.Cartesian2(20, 0),
              // scale: Property,
              show: true,
              // translucencyByDistance: Property,
              // pixelOffsetScaleByDistance: Property,
            });

            // Custom properties
            entity.customProperties = {
              uploadedContentList: [],
            };

            // Set 'cesiumDrawingToolsProperties.activeDataSource.show' to true if display is off
            cesiumDrawingToolsProperties.activeDataSource.show = true;
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      } else {
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      }
    });

    return drawMarkerButton;
  }

  private initDrawPolylineButtonFunctions(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties: any,
    drawingTool: any) {
    const drawPolylineButton = document.getElementById(drawingTool.id);
    drawPolylineButton.addEventListener('click', () => {
      drawingTool.isActivated = !drawingTool.isActivated;
      const drawingToolsHandler = cesiumDrawingToolsProperties.drawingToolsHandler;
      if (drawingTool.isActivated) {
        // Reset/de-activate all other drawing tools
        this.resetDrawingToolsButtons(cesiumDrawingToolsProperties, drawingTool);
        let isDrawing = false;
        let positions = [];
        let tempIndicatorPoints;
        let polylineEntity;
        // Add LEFT_DOUBLE_CLICK action to start drawing polyline
        drawingToolsHandler.setInputAction((click: any) => {
          isDrawing = !isDrawing;
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position' and push into 'positions'
            const ellipsoid = cesiumViewer.scene.globe.ellipsoid;
            const cartesian = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            positions.push(cartesian);

            // Initialise entity id
            cesiumDrawingToolsProperties.totalEntityCount += 1;
            const entityId = 'polyline-' + (cesiumDrawingToolsProperties.totalEntityCount);
            const currDateTimestamp = moment(new Date()).format('YYYYMMDD-hhmmss');
            const dataSourceEntityId = cesiumDrawingToolsProperties.activeDataSource.name + ' - ' + entityId + ' - ' +
              '[' + currDateTimestamp + ']';

            // Draw polyline entity
            polylineEntity =
              cesiumDrawingToolsProperties.activeDataSource.entities.getOrCreateEntity(dataSourceEntityId);
            polylineEntity.name = entityId;
            polylineEntity.polyline = {
              positions: new Cesium.CallbackProperty(() => {
                return positions; // Note: positions is constantly updated in the 'MOUSE_MOVE' handler
              }, false),
              material: Cesium.Color.RED,
              // material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
              width: 3,
            };

            // Add entity label (Note: 'position' is initialised to set label starting position)
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude);
            const latInDegrees = Cesium.Math.toDegrees(cartographic.latitude);
            const heightInMetres = 0;
            polylineEntity.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(lonInDegrees, latInDegrees, heightInMetres));
            polylineEntity.label = new Cesium.LabelGraphics({
              text: new Cesium.ConstantProperty(polylineEntity.name),
              font: '12pt Lucida Sans',
              style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.LEFT),
              verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.CENTER),
              eyeOffset: new Cesium.Cartesian3(0, 0, -1),
              pixelOffset: new Cesium.Cartesian2(20, 0),
              // scale: Property,
              show: true,
              // translucencyByDistance: Property,
              // pixelOffsetScaleByDistance: Property,
            });

            // Custom properties
            polylineEntity.customProperties = {
              uploadedContentList: [],
            };

            // Set 'cesiumDrawingToolsProperties.activeDataSource.show' to true if display is off
            cesiumDrawingToolsProperties.activeDataSource.show = true;

            // Create a pointPrimitive collection to draw temp point indicators to show polyline
            // joints
            tempIndicatorPoints = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
            tempIndicatorPoints.add(
              {
                position: cartesian,
                color: Cesium.Color.WHITE,
              },
            );
          } else {
            const positionsConfirmed = positions.slice(); // Clone 'positions' without object
            // reference
            polylineEntity.polyline.positions = positionsConfirmed;
            positions = []; // Reset 'positions'
            tempIndicatorPoints.removeAll(); // Reset 'tempIndicatorPoints'
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Add LEFT_CLICK action to extend polyline
        drawingToolsHandler.setInputAction((click: any) => {
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position' and push into 'positions' to extend
            // polyline
            const ellipsoid = cesiumViewer.scene.globe.ellipsoid;
            const cartesian = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            positions.push(cartesian);

            // Extend temp point indicators to show polyline joints
            tempIndicatorPoints.add(
              {
                position: cartesian,
                color: Cesium.Color.WHITE,
              },
            );
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      } else {
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    });
  }

  private initDrawPolygonButtonFunctions(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties: any,
    drawingTool: any) {
    const drawPolygonButton = document.getElementById(drawingTool.id);
    drawPolygonButton.addEventListener('click', () => {
      drawingTool.isActivated = !drawingTool.isActivated;
      const drawingToolsHandler = cesiumDrawingToolsProperties.drawingToolsHandler;
      if (drawingTool.isActivated) {
        // Reset/de-activate all other drawing tools
        this.resetDrawingToolsButtons(cesiumDrawingToolsProperties, drawingTool);
        let isDrawing = false;
        let positionsInDegrees = [];
        let tempIndicatorPoints;
        let polygonEntity;
        // Add LEFT_DOUBLE_CLICK action to start drawing polygons
        drawingToolsHandler.setInputAction((click: any) => {
          isDrawing = !isDrawing;
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position' and push into 'positions'
            const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
            const cartesian: any = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude);
            const latInDegrees = Cesium.Math.toDegrees(cartographic.latitude);
            positionsInDegrees.push(lonInDegrees);
            positionsInDegrees.push(latInDegrees);

            // Initlialise entity id
            cesiumDrawingToolsProperties.totalEntityCount += 1;
            const entityId = 'polygon-' + (cesiumDrawingToolsProperties.totalEntityCount);
            const currDateTimestamp = moment(new Date()).format('YYYYMMDD-hhmmss');
            const dataSourceEntityId = cesiumDrawingToolsProperties.activeDataSource.name + ' - ' + entityId + ' - ' +
              '[' + currDateTimestamp + ']';

            // Draw polygon entity
            polygonEntity =
              cesiumDrawingToolsProperties.activeDataSource.entities.getOrCreateEntity(dataSourceEntityId);
            polygonEntity.name = entityId;
            polygonEntity.polygon = new Cesium.PolygonGraphics({
              hierarchy: new Cesium.ConstantProperty(Cesium.Cartesian3.fromDegreesArray(positionsInDegrees)),
              material: new Cesium.Color(1.0, 0.0, 0.0, 0.4),
            });

            // Set 'cesiumDrawingToolsProperties.activeDataSource.show' to true if display is off
            cesiumDrawingToolsProperties.activeDataSource.show = true;

            // Create a pointPrimitive collection to draw temp point indicators to show polygon
            // joints
            tempIndicatorPoints = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
            tempIndicatorPoints.add(
              {
                position: cartesian,
                color: Cesium.Color.WHITE,
              },
            );
          } else {
            const minimumNumOfPositionsToDrawAPolygon = 6; // Note: Stores 'lonInDegrees,
            // latInDegrees', therefore minimum 3
            // pts * 2 = 6
            if (positionsInDegrees.length >= minimumNumOfPositionsToDrawAPolygon) {
              const positionsInDegreesConfirmed = positionsInDegrees.slice(); // Clone positions
              // without object
              // reference
              polygonEntity.polygon.hierarchy = Cesium.Cartesian3.fromDegreesArray(positionsInDegreesConfirmed);

              // Add entity label
              const cesiumJulianDate = Cesium.JulianDate.fromDate(new Date());
              const center = Cesium.BoundingSphere.fromPoints(
                polygonEntity.polygon.hierarchy.getValue(cesiumJulianDate)).center;
              Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
              polygonEntity.position = new Cesium.ConstantPositionProperty(center);
              polygonEntity.label = new Cesium.LabelGraphics({
                text: new Cesium.ConstantProperty(polygonEntity.name),
                font: '12pt Lucida Sans',
                style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1,
                horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.CENTER),
                verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.CENTER),
                eyeOffset: new Cesium.Cartesian3(0, 0, -1),
                pixelOffset: new Cesium.Cartesian2(0, 0), // Initialised only to sync with other
                // entity types
                // scale: Property,
                show: true,
                // translucencyByDistance: Property,
                // pixelOffsetScaleByDistance: Property,
              });

              // Custom properties
              polygonEntity.customProperties = {
                uploadedContentList: [],
              };

            } else {
              cesiumDrawingToolsProperties.activeDataSource.entities.removeById(polygonEntity.id);
            }
            positionsInDegrees = []; // Reset 'positionsInDegrees'
            tempIndicatorPoints.removeAll(); // Reset 'tempIndicatorPoints'
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Add LEFT_CLICK action to extend polygon
        drawingToolsHandler.setInputAction((click: any) => {
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position' and push into 'positionsInDegrees' to
            // extend polygon
            const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
            const cartesian: any = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude);
            const latInDegrees = Cesium.Math.toDegrees(cartographic.latitude);
            positionsInDegrees.push(lonInDegrees);
            positionsInDegrees.push(latInDegrees);
            polygonEntity.polygon.hierarchy = Cesium.Cartesian3.fromDegreesArray(positionsInDegrees);

            // Extend temp point indicators to show polygon joints
            tempIndicatorPoints.add(
              {
                position: cartesian,
                color: Cesium.Color.WHITE,
              },
            );
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      } else {
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    });
  }

  private initDrawCircleButtonFunctions(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties: any,
    drawingTool: any) {
    const drawCircleButton = document.getElementById(drawingTool.id);
    drawCircleButton.addEventListener('click', () => {
      drawingTool.isActivated = !drawingTool.isActivated;
      const drawingToolsHandler = cesiumDrawingToolsProperties.drawingToolsHandler;
      if (drawingTool.isActivated) {
        // Reset/de-activate all other drawing tools
        this.resetDrawingToolsButtons(cesiumDrawingToolsProperties, drawingTool);
        let isDrawing = false;
        let radiusInMetres;
        let startCartographic;
        let endCartographic;
        let tempIndicatorPoints;
        let radiusInMetresToolTipElement;
        let circleEntity;
        // Add LEFT_DOUBLE_CLICK action to start drawing circle
        drawingToolsHandler.setInputAction((click: any) => {
          isDrawing = !isDrawing;
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position'
            const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
            const cartesian: any = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            startCartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const lonInDegrees = Cesium.Math.toDegrees(startCartographic.longitude);
            const latInDegrees = Cesium.Math.toDegrees(startCartographic.latitude);
            const heightInMetres = 0;

            // Initialise entity id
            cesiumDrawingToolsProperties.totalEntityCount += 1;
            const entityId = 'circle-' + (cesiumDrawingToolsProperties.totalEntityCount);
            const currDateTimestamp = moment(new Date()).format('YYYYMMDD-hhmmss');
            const dataSourceEntityId = cesiumDrawingToolsProperties.activeDataSource.name + ' - ' + entityId + ' - ' +
              '[' + currDateTimestamp + ']';

            // Draw circle entity
            radiusInMetres = 0; // Start from 0
            circleEntity = cesiumDrawingToolsProperties.activeDataSource.entities.getOrCreateEntity(dataSourceEntityId);
            circleEntity.name = entityId;
            circleEntity.position = Cesium.Cartesian3.fromDegrees(lonInDegrees, latInDegrees, heightInMetres);
            circleEntity.ellipse = {
              semiMinorAxis: new Cesium.CallbackProperty(() => {
                return radiusInMetres;
              }, false),
              semiMajorAxis: new Cesium.CallbackProperty(() => {
                return radiusInMetres;
              }, false),
              height: 0,
              material: new Cesium.Color(1.0, 0.0, 0.0, 0.4),
            };

            // Add entity label
            circleEntity.label = new Cesium.LabelGraphics({
              text: new Cesium.ConstantProperty(circleEntity.name),
              font: '12pt Lucida Sans',
              style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.LEFT),
              verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.CENTER),
              eyeOffset: new Cesium.Cartesian3(0, 0, -1),
              pixelOffset: new Cesium.Cartesian2(20, 0),
              // scale: Property,
              show: true,
              // translucencyByDistance: Property,
              // pixelOffsetScaleByDistance: Property,
            });

            // Custom properties
            circleEntity.customProperties = {
              uploadedContentList: [],
            };

            // Set 'cesiumDrawingToolsProperties.activeDataSource.show' to true if display is off
            cesiumDrawingToolsProperties.activeDataSource.show = true;

            // Create a pointPrimitive collection to draw temp point indicators to show circle
            // center
            tempIndicatorPoints = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
            tempIndicatorPoints.add(
              {
                position: cartesian,
                color: Cesium.Color.WHITE,
              },
            );

            // Add tooltip html element to show 'radiusInMetres' when drawing circle
            const windowXYPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(cesiumViewer.scene, cartesian);
            radiusInMetresToolTipElement = document.createElement('div');
            radiusInMetresToolTipElement.id = 'temp-tooltip';
            radiusInMetresToolTipElement.style.position = 'absolute';
            radiusInMetresToolTipElement.style.backgroundColor = 'rgba(20, 20, 20, 0.5)';
            radiusInMetresToolTipElement.style.font = '24px agency';
            radiusInMetresToolTipElement.style.top = windowXYPosition.y + 'px';
            radiusInMetresToolTipElement.style.left = (windowXYPosition.x + 5) + 'px';
            radiusInMetresToolTipElement.innerHTML =
              '<span class="title">Radius(Metres): ' + radiusInMetres.toFixed(2) + '</span>';
            cesiumViewer.container.appendChild(radiusInMetresToolTipElement);
          } else {
            const radiusInMetresConfirmed = radiusInMetres; // Clone positions without object
            // reference
            circleEntity.ellipse.semiMinorAxis = radiusInMetresConfirmed;
            circleEntity.ellipse.semiMajorAxis = radiusInMetresConfirmed;

            circleEntity.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
            circleEntity.label.pixelOffset = new Cesium.Cartesian2(0, 0);

            // Reset
            radiusInMetres = 0;
            startCartographic = null;
            endCartographic = null;
            tempIndicatorPoints.removeAll(); // Reset 'tempIndicatorPoints'
            cesiumViewer.container.removeChild(radiusInMetresToolTipElement);
            radiusInMetresToolTipElement = null;
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Add MOUSE_MOVE action to expand/minimize circle during drawing
        drawingToolsHandler.setInputAction((movement: any) => {
          if (isDrawing && startCartographic) {
            // Get lon/lat in degrees from 'movement.endPosition' to expand/minimize circle during drawing
            const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
            const cartesian: any = cesiumViewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            // Note: 'startCartographic' is initialised in LEFT_DOUBLE_CLICK action
            endCartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const ellipsoidGeodesic = new Cesium.EllipsoidGeodesic(startCartographic, endCartographic);
            radiusInMetres = ellipsoidGeodesic.surfaceDistance;

            // Update 'radiusInMetres' for tooltip html element
            const windowXYPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(cesiumViewer.scene, cartesian);
            if (radiusInMetresToolTipElement) {
              radiusInMetresToolTipElement.style.top = windowXYPosition.y + 'px';
              radiusInMetresToolTipElement.style.left = (windowXYPosition.x + 10) + 'px';
              radiusInMetresToolTipElement.innerHTML =
                '<span class="title">Radius(Metres): ' + radiusInMetres.toFixed(2) + '</span>';
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      } else {
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    });
  }

  private initDrawScribbleButtonFunctions(cesiumViewer: Cesium.Viewer, cesiumDrawingToolsProperties: any,
    drawingTool: any) {
    const drawScribbleButton = document.getElementById(drawingTool.id);
    drawScribbleButton.addEventListener('click', () => {
      drawingTool.isActivated = !drawingTool.isActivated;
      const drawingToolsHandler = cesiumDrawingToolsProperties.drawingToolsHandler;
      if (drawingTool.isActivated) {
        // Reset/de-activate all other drawing tools
        this.resetDrawingToolsButtons(cesiumDrawingToolsProperties, drawingTool);
        let isDrawing = false;
        let positions = [];
        let tempIndicatorPoints;
        let scribblePolylineEntity;
        // Add LEFT_DOUBLE_CLICK action to start scribbling (i.e. draw scribble polyline entity)
        drawingToolsHandler.setInputAction((click: any) => {
          isDrawing = !isDrawing;
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position' and push into 'positions'
            const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
            const cartesian: any = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
            positions.push(cartesian);

            // Initialise entity id
            cesiumDrawingToolsProperties.totalEntityCount += 1;
            const entityId = 'scribble-polyline-' + (cesiumDrawingToolsProperties.totalEntityCount);
            const currDateTimestamp = moment(new Date()).format('YYYYMMDD-hhmmss');
            const dataSourceEntityId = cesiumDrawingToolsProperties.activeDataSource.name + ' - ' + entityId + ' - ' +
              '[' + currDateTimestamp + ']';

            // Draw scribble polyline entity
            scribblePolylineEntity =
              cesiumDrawingToolsProperties.activeDataSource.entities.getOrCreateEntity(dataSourceEntityId);
            scribblePolylineEntity.name = entityId;
            scribblePolylineEntity.polyline = {
              positions: new Cesium.CallbackProperty(() => {
                return positions; // Note: positions is constantly updated in MOUSE_MOVE action
              }, false),
              material: Cesium.Color.RED,
              width: 3,
            };

            // Add entity label
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude);
            const latInDegrees = Cesium.Math.toDegrees(cartographic.latitude);
            const heightInMetres = 0;
            scribblePolylineEntity.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(lonInDegrees, latInDegrees, heightInMetres));
            scribblePolylineEntity.label = new Cesium.LabelGraphics({
              text: new Cesium.ConstantProperty(scribblePolylineEntity.name),
              font: '12pt Lucida Sans',
              style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.LEFT),
              verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.CENTER),
              eyeOffset: new Cesium.Cartesian3(0, 0, -1),
              pixelOffset: new Cesium.Cartesian2(20, 0),
              // scale: Property,
              show: true,
              // translucencyByDistance: Property,
              // pixelOffsetScaleByDistance: Property,
            });

            // Custom properties
            scribblePolylineEntity.customProperties = {
              uploadedContentList: [],
            };

            // Set 'cesiumDrawingToolsProperties.activeDataSource.show' to true if display is off
            cesiumDrawingToolsProperties.activeDataSource.show = true;

            // Create a pointPrimitive collection to draw temp point indicators to show start of scribble
            tempIndicatorPoints = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
            tempIndicatorPoints.add(
              {
                position: cartesian,
                color: Cesium.Color.WHITE,
              },
            );
          } else {
            const positionsConfirmed = positions.slice(); // Clone positions without object reference
            scribblePolylineEntity.polyline.positions = positionsConfirmed;
            positions = []; // Reset 'positions'
            tempIndicatorPoints.removeAll(); // Reset 'tempIndicatorPoints'
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Add MOUSE_MOVE action to extend/update scribbling (i.e. scribble polyline entity)
        drawingToolsHandler.setInputAction((movement: any) => {
          if (isDrawing) {
            // Get lon/lat in degrees from 'click.position' to extend/update scribbling (i.e. scribble polyline entity)
            const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
            const cartesian: any = cesiumViewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            positions.push(cartesian);
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      } else {
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        drawingToolsHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    });
  }

  private addDefaultRightClickInputAction(cesiumViewer: Cesium.Viewer) {
    cesiumViewer.screenSpaceEventHandler.setInputAction((click: any) => {
      console.log('ACTION');
      let cartesian: any;
      let cartographic: any;
      let lonInDegrees: any;
      let latInDegrees: any;
      let ellipsoid: any;

      // Camera position
      cartesian = cesiumViewer.camera.position;
      cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
      latInDegrees = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);


      console.log('CAMERA: ' + lonInDegrees + ', ' + latInDegrees + ', ' +
        cesiumViewer.camera.positionCartographic.height + ', '
        + cesiumViewer.camera.pitch);
      // console.log('heading, pitch, roll: ' + cesiumViewer.camera.heading + ', ' + cesiumViewer.camera.pitch + ', '
      //   + cesiumViewer.camera.roll);

      // Click position
      ellipsoid = cesiumViewer.scene.globe.ellipsoid;
      cartesian = cesiumViewer.camera.pickEllipsoid(click.position, ellipsoid);
      cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      lonInDegrees = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
      latInDegrees = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
      console.log('RIGHT CLICK: ' + lonInDegrees + ', ' + latInDegrees + ', ' +
        cesiumViewer.camera.positionCartographic.height);



    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  private addDefaultMouseMoveInputAction(cesiumViewer: Cesium.Viewer) {
    cesiumViewer.screenSpaceEventHandler.setInputAction((movement: any) => {
      const ellipsoid: any = cesiumViewer.scene.globe.ellipsoid;
      const cartesian: any = cesiumViewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
      const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

      const mouseOverEntity = cesiumViewer.scene.pick(movement.endPosition);
      if (Cesium.defined(mouseOverEntity) && mouseOverEntity.id && mouseOverEntity.id.id) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  private convertDataSourceToGeoJson(dataSource) {
    let geoJsonString = '';
    let featureGeoJsonObj;

    const cesiumJulianDate = Cesium.JulianDate.fromDate(new Date());

    if (dataSource && dataSource.entities) {
      geoJsonString = '{"type":"FeatureCollection","features":[';

      for (let i = 0; i < dataSource.entities.values.length; i += 1) {
        const entity = dataSource.entities.values[i];
        let featureGeoJsonString = '';

        if (entity.billboard) { // Billboard is a 'Point' object in geojson
          // Properties in use in cesium billboard entities: 'id', 'name', 'position', 'billboard.image',
          // 'billboard.height', 'billboard.width', 'billboard.color'
          featureGeoJsonObj = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [] },
            properties: {},
          };

          // Initialise 'position' for 'featureGeoJsonObj.geometry.coordinates'
          const cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
            entity.position.getValue(cesiumJulianDate));
          featureGeoJsonObj.geometry.coordinates[0] = (cartographicPosition.longitude * 360) / (2 * Cesium.Math.PI);
          featureGeoJsonObj.geometry.coordinates[1] = (cartographicPosition.latitude * 360) / (2 * Cesium.Math.PI);

          // Initialise the following for 'featureGeoJsonObj.properties'
          featureGeoJsonObj.properties.id = entity.id; // Initialise 'id'
          featureGeoJsonObj.properties.name = entity.name; // Initialise 'name'
          featureGeoJsonObj.properties.billboard = {  // Initialise 'billboard'
            image: entity.billboard.image.getValue(cesiumJulianDate),
            height: entity.billboard.height.getValue(cesiumJulianDate),
            width: entity.billboard.width.getValue(cesiumJulianDate),
            color: entity.billboard.color.getValue(cesiumJulianDate),
          };
          featureGeoJsonObj.properties.label = { // Initialise 'label'
            text: entity.label.text.getValue(cesiumJulianDate),
            font: entity.label.font.getValue(cesiumJulianDate),
            style: entity.label.style.getValue(cesiumJulianDate),
            fillColor: entity.label.fillColor.getValue(cesiumJulianDate),
            outlineColor: entity.label.outlineColor.getValue(cesiumJulianDate),
            outlineWidth: entity.label.outlineWidth.getValue(cesiumJulianDate),
            horizontalOrigin: entity.label.horizontalOrigin.getValue(cesiumJulianDate),
            // verticalOrigin: entity.label.verticalOrigin.getValue(cesiumJulianDate),
            eyeOffset: entity.label.eyeOffset.getValue(cesiumJulianDate),
            pixelOffset: entity.label.pixelOffset.getValue(cesiumJulianDate),
            // scale: entity.label.scale.getValue(cesiumJulianDate),
            show: entity.label.show.getValue(cesiumJulianDate),
            // translucencyByDistance:
            // entity.label.translucencyByDistance.getValue(cesiumJulianDate),
            // pixelOffsetScaleByDistance:
            // entity.label.pixelOffsetScaleByDistance.getValue(cesiumJulianDate),
          };

          featureGeoJsonString = JSON.stringify(featureGeoJsonObj);

        } else if (entity.polyline) {
          featureGeoJsonObj = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [] },
            properties: {},
          };

          // Initialise 'featureGeoJsonObj.geometry.coordinates' (Note: 'positions' will be initialised from
          // featureGeoJsonObj.properties.polyline instead during 'Import')
          const positions = entity.polyline.positions.getValue(cesiumJulianDate);
          for (let j = 0; j < positions.length; j += 1) {
            const cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(positions[j]);
            const lonLatArray = [
              (cartographicPosition.longitude * 360) / (2 * Cesium.Math.PI),
              (cartographicPosition.latitude * 360) / (2 * Cesium.Math.PI),
            ];
            featureGeoJsonObj.geometry.coordinates.push(lonLatArray);
          }

          // Initialise the following for 'featureGeoJsonObj.properties'
          featureGeoJsonObj.properties.id = entity.id; // Initialise 'id'
          featureGeoJsonObj.properties.name = entity.name; // Initialise 'name'
          featureGeoJsonObj.properties.polyline = {  // Initialise 'polyline'
            positions: entity.polyline.positions.getValue(cesiumJulianDate),
            material: entity.polyline.material.getValue(cesiumJulianDate),
            width: entity.polyline.width.getValue(cesiumJulianDate),
          };
          featureGeoJsonObj.properties.label = { // Initialise 'label'
            text: entity.label.text.getValue(cesiumJulianDate),
            font: entity.label.font.getValue(cesiumJulianDate),
            style: entity.label.style.getValue(cesiumJulianDate),
            fillColor: entity.label.fillColor.getValue(cesiumJulianDate),
            outlineColor: entity.label.outlineColor.getValue(cesiumJulianDate),
            outlineWidth: entity.label.outlineWidth.getValue(cesiumJulianDate),
            horizontalOrigin: entity.label.horizontalOrigin.getValue(cesiumJulianDate),
            // verticalOrigin: entity.label.verticalOrigin.getValue(cesiumJulianDate),
            eyeOffset: entity.label.eyeOffset.getValue(cesiumJulianDate),
            pixelOffset: entity.label.pixelOffset.getValue(cesiumJulianDate),
            // scale: entity.label.scale.getValue(cesiumJulianDate),
            show: entity.label.show.getValue(cesiumJulianDate),
            // translucencyByDistance:
            // entity.label.translucencyByDistance.getValue(cesiumJulianDate),
            // pixelOffsetScaleByDistance:
            // entity.label.pixelOffsetScaleByDistance.getValue(cesiumJulianDate),
          };

          featureGeoJsonString = JSON.stringify(featureGeoJsonObj);

        } else if (entity.polygon) {
          featureGeoJsonObj = {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [] },
            properties: {},
          };

          // Initialise 'featureGeoJsonObj.geometry.coordinates' (Note: 'positions' will be initialised from
          // featureGeoJsonObj.properties.polygon.hierachy' instead during 'Import')
          const hierarchy = entity.polygon.hierarchy.getValue(cesiumJulianDate);
          let positions = hierarchy.positions;
          if (!positions) { // To handle 'polygon.hierarchy' when it is a callback
            positions = hierarchy;
          }
          const lonLatArraySet = [];
          for (let j = 0; j < positions.length; j += 1) {
            const cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(positions[j]);
            const lonLatArray = [
              (cartographicPosition.longitude * 360) / (2 * Cesium.Math.PI),
              (cartographicPosition.latitude * 360) / (2 * Cesium.Math.PI),
            ];
            lonLatArraySet.push(lonLatArray);
          }
          featureGeoJsonObj.geometry.coordinates.push(lonLatArraySet);

          // Initialise the following for 'featureGeoJsonObj.properties'
          featureGeoJsonObj.properties.id = entity.id; // Initialise 'id'
          featureGeoJsonObj.properties.name = entity.name; // Initialise 'name'
          featureGeoJsonObj.properties.polygon = {  // Initialise 'polygon'
            hierarchy: entity.polygon.hierarchy.getValue(cesiumJulianDate),
            material: entity.polygon.material.getValue(cesiumJulianDate),
          };
          featureGeoJsonObj.properties.label = { // Initialise 'label'
            text: entity.label.text.getValue(cesiumJulianDate),
            font: entity.label.font.getValue(cesiumJulianDate),
            style: entity.label.style.getValue(cesiumJulianDate),
            fillColor: entity.label.fillColor.getValue(cesiumJulianDate),
            outlineColor: entity.label.outlineColor.getValue(cesiumJulianDate),
            outlineWidth: entity.label.outlineWidth.getValue(cesiumJulianDate),
            horizontalOrigin: entity.label.horizontalOrigin.getValue(cesiumJulianDate),
            verticalOrigin: entity.label.verticalOrigin.getValue(cesiumJulianDate),
            eyeOffset: entity.label.eyeOffset.getValue(cesiumJulianDate),
            pixelOffset: entity.label.pixelOffset.getValue(cesiumJulianDate),
            // scale: entity.label.scale.getValue(cesiumJulianDate),
            show: entity.label.show.getValue(cesiumJulianDate),
            // translucencyByDistance:
            // entity.label.translucencyByDistance.getValue(cesiumJulianDate),
            // pixelOffsetScaleByDistance:
            // entity.label.pixelOffsetScaleByDistance.getValue(cesiumJulianDate),
          };

          featureGeoJsonString = JSON.stringify(featureGeoJsonObj);

        } else if (entity.ellipse) {
          featureGeoJsonObj = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [] },
            properties: {},
          };

          // Initialise 'position' for 'featureGeoJsonObj.geometry.coordinates'
          const cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
            entity.position.getValue(cesiumJulianDate));
          featureGeoJsonObj.geometry.coordinates[0] = (cartographicPosition.longitude * 360) / (2 * Cesium.Math.PI);
          featureGeoJsonObj.geometry.coordinates[1] = (cartographicPosition.latitude * 360) / (2 * Cesium.Math.PI);

          // Initialise the following for 'featureGeoJsonObj.properties'
          featureGeoJsonObj.properties.id = entity.id; // Initialise 'id'
          featureGeoJsonObj.properties.name = entity.name; // Initialise 'name'
          featureGeoJsonObj.properties.position = entity.position.getValue(cesiumJulianDate);
          featureGeoJsonObj.properties.ellipse = {  // Initialise 'ellipse'
            semiMinorAxis: entity.ellipse.semiMinorAxis.getValue(cesiumJulianDate),
            semiMajorAxis: entity.ellipse.semiMajorAxis.getValue(cesiumJulianDate),
            height: entity.ellipse.height.getValue(cesiumJulianDate),
            material: entity.ellipse.material.getValue(cesiumJulianDate),
          };
          featureGeoJsonObj.properties.label = { // Initialise 'label'
            text: entity.label.text.getValue(cesiumJulianDate),
            font: entity.label.font.getValue(cesiumJulianDate),
            style: entity.label.style.getValue(cesiumJulianDate),
            fillColor: entity.label.fillColor.getValue(cesiumJulianDate),
            outlineColor: entity.label.outlineColor.getValue(cesiumJulianDate),
            outlineWidth: entity.label.outlineWidth.getValue(cesiumJulianDate),
            horizontalOrigin: entity.label.horizontalOrigin.getValue(cesiumJulianDate),
            verticalOrigin: entity.label.verticalOrigin.getValue(cesiumJulianDate),
            eyeOffset: entity.label.eyeOffset.getValue(cesiumJulianDate),
            pixelOffset: entity.label.pixelOffset.getValue(cesiumJulianDate),
            // scale: entity.label.scale.getValue(cesiumJulianDate),
            show: entity.label.show.getValue(cesiumJulianDate),
            // translucencyByDistance:
            // entity.label.translucencyByDistance.getValue(cesiumJulianDate),
            // pixelOffsetScaleByDistance:
            // entity.label.pixelOffsetScaleByDistance.getValue(cesiumJulianDate),
          };

          featureGeoJsonString = JSON.stringify(featureGeoJsonObj);
        }

        geoJsonString += featureGeoJsonString;
        // If is not the last object/entity, add ','
        if ((dataSource.entities.values.length > 1) && (i !== (dataSource.entities.values.length - 1))) {
          geoJsonString += ',';
        }
      }
    }

    geoJsonString += ']}'; // 'ending' of geojson string
    return geoJsonString;
  }
}
