import { Component, AfterViewInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { CesiumService } from '../../../../service/cesium.service';
import { LoadMapLayerService } from '../../../../service/loadMapLayer.service';
import { SocketWebService } from '../../../../service/web/socket.web.service';
import { MessageService } from 'primeng/components/common/messageservice';

import * as convert from 'xml-js';
import * as ontime from 'ontime';
import * as moment from 'moment';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [MessageService],
})
export class AppMapComponent implements AfterViewInit {
  // subscription: Subscription;

  cesiumViewer: Cesium.Viewer;
  cesiumMapContainerId = 'main-cesium-container';
  cesiumCreditContainerId = 'main-cesium-credit-container';

  cesiumDrawingToolsContainerId = 'main-cesium-drawing-tools-button-container';
  cesiumDrawingToolsProperties = {
    activeDataSource: null,
    totalEntityCount: 0,
    pickedEntity: null,
    pickedCCTVs: [],
    pickedEntityEditable: true,
    selectedIcon: '',
    selectedColor: '',
    selectedAlpha: 10, // Note: Converted to 1-10 due to slider not able to take in decimal steps
    displayEntityDetailsDialog: false,
    displayEntityDetailsActions: [],
    displayEntityDetailsDialog_xPos: 0,
    displayEntityDetailsDialog_yPos: 0,
    drawingToolsHandler: null,
    drawingTools: [
      {
        id: 'main-draw-marker',
        type: 'draw-marker',
        isActivated: false,
        iconUrl: 'assets/icons/solid/map-marker-alt-white.svg',
      },
      {
        id: 'main-draw-polyline',
        type: 'draw-polyline',
        isActivated: false,
        iconUrl: 'assets/icons/solid/map-polyline-white.svg',
      },
      {
        id: 'main-draw-polygon',
        type: 'draw-polygon',
        isActivated: false,
        iconUrl: 'assets/icons/solid/map-polygon-white.svg',
      },
      {
        id: 'main-draw-circle',
        type: 'draw-circle',
        isActivated: false,
        iconUrl: 'assets/icons/solid/map-circle-white.svg',
      },
      {
        id: 'main-draw-scribble',
        type: 'draw-scribble',
        isActivated: false,
        iconUrl: 'assets/icons/solid/map-scribble-white.svg',
      },
    ],
  };

  isOverlayManagerVisible = false;

  // Personal Layers
  cesiumDataSourceCount = 0;
  cesiumDataSources = []; // cesiumViewer.dataSources is not an iterable object. Therefore have to
  // create an array to store dataSource objects
  activeDataSource: Cesium.DataSource;

  // cesiumPublishedDataSources = []; // Published Layers
  // cesiumIncidentDataSources = []; // Incident Layers
  cesiumStaticDataSources = []; // Static Layers
  cesiumDynamicDataSources = []; // Dynamic Layers

  isCesiumPersonalDataSourcesLabelsVisible = true;
  // isCesiumIncidentDataSourcesLabelsVisible = true;
  // isCesiumPublishedDataSourcesLabelsVisible = true;
  isCesiumStaticDataSourcesLabelsVisible = true;
  isCesiumDynamicDataSourcesLabelsVisible = true;

  displayEditDataSourceDialog = false;
  editableDataSource: Cesium.DataSource;
  editableDataSourceName;
  hasDuplicateDataSourceName = false;
  isInvalidDataSourceName = false;

  markerIcons = [
    { iconUrl: 'assets/markers/marker-white.png' },
    { iconUrl: 'assets/markers/custom/army.png' },
    { iconUrl: 'assets/markers/custom/joint.png' },
    { iconUrl: 'assets/markers/custom/police.png' },
    { iconUrl: 'assets/markers/custom/police-2.png' },
    { iconUrl: 'assets/markers/custom/police-car.png' },
    { iconUrl: 'assets/markers/custom/ambulance.png' },
    { iconUrl: 'assets/markers/custom/fire-truck.png' },
    { iconUrl: 'assets/markers/custom/hospital.png' },
    { iconUrl: 'assets/markers/custom/medical-kit.png' },
    { iconUrl: 'assets/markers/custom/accident.png' },
    { iconUrl: 'assets/markers/custom/roadblock.png' },
    { iconUrl: 'assets/markers/custom/attention.png' },
    { iconUrl: 'assets/markers/custom/stop.png' },
    { iconUrl: 'assets/markers/custom/gun.png' },
    { iconUrl: 'assets/markers/custom/shooter.png' },
    { iconUrl: 'assets/markers/custom/terrorist.png' },
  ];

  constructor(private cesiumService: CesiumService, private loadMapLayerService: LoadMapLayerService,
    private http: HttpClient, private sanitizer: DomSanitizer,
    private socketService: SocketWebService, private messageService: MessageService) {
  }

  ngAfterViewInit() {
    if (!this.cesiumViewer && document.getElementById(this.cesiumMapContainerId)) {
      setTimeout(() => { // Removes issue where cesiumViewer is initialised before HTML elements are fully rendered
        this.cesiumViewer =
          this.cesiumService.initCesiumViewer(this.cesiumMapContainerId, this.cesiumCreditContainerId);

        // TODO: Create 'datasource-data-service' and get datasources (Personal & Published) from backend
        this.addDataSourceAndSetAsActive(); // Note: 'this.activeDataSource' is updated in method
        this.cesiumService.initCesiumDrawingTools(this.cesiumViewer, this.cesiumDrawingToolsContainerId,
          this.cesiumDrawingToolsProperties);

        // this.initPublishedDataSources();
        this.initStaticDataSources(); // Initialise static datasources // TODO: Might put in 'cesium.service' so all
                                      // components tt uses the service can load static datasources
        this.initDynamicDataSources(); // Initialise dynamic datasources
      }, 100); // Delay by 0.1 seconds
    }
  }

  toggleLayerSidebarVisibility() {
    
    this.isOverlayManagerVisible = !this.isOverlayManagerVisible;
    if (!this.isOverlayManagerVisible) {
      this.cesiumService.resetDrawingToolsButtons(this.cesiumDrawingToolsProperties, null);
    }
    // console.log("toggleLayerSidebarVisibility", this.isOverlayManagerVisible);
  }
  
  toggleSelectAll(selectAllCheckbox, dataSources: Cesium.DataSource[]) {
    for (let i = 0; i < dataSources.length; i += 1) {
      const dataSource = dataSources[i];
      dataSource.show = selectAllCheckbox.checked;
    }
  }

  toggleLabels(dataSource: Cesium.DataSource) {
    for (let i = 0; i < dataSource.entities.values.length; i += 1) {
      const entity: any = dataSource.entities.values[i];
      entity.label.show = !entity.label.show._value;
    }
  }

  toggleAllLabels(dataSources: Cesium.DataSource[], layerType: string) {
    let isVisible = false;

    if (layerType === 'personal') {
      this.isCesiumPersonalDataSourcesLabelsVisible = !this.isCesiumPersonalDataSourcesLabelsVisible;
      isVisible = this.isCesiumPersonalDataSourcesLabelsVisible;
    // } else if (layerType === 'incident') {
    //   this.isCesiumIncidentDataSourcesLabelsVisible = !this.isCesiumIncidentDataSourcesLabelsVisible;
    //   isVisible = this.isCesiumIncidentDataSourcesLabelsVisible;
    // } else if (layerType === 'published') {
    //   this.isCesiumPublishedDataSourcesLabelsVisible = !this.isCesiumPublishedDataSourcesLabelsVisible;
    //   isVisible = this.isCesiumPublishedDataSourcesLabelsVisible;
    } else if (layerType === 'static') {
      this.isCesiumStaticDataSourcesLabelsVisible = !this.isCesiumStaticDataSourcesLabelsVisible;
      isVisible = this.isCesiumStaticDataSourcesLabelsVisible;
    } else if (layerType === 'dynamic') {
      this.isCesiumDynamicDataSourcesLabelsVisible = !this.isCesiumDynamicDataSourcesLabelsVisible;
      isVisible = this.isCesiumDynamicDataSourcesLabelsVisible;
    }

    for (let i = 0; i < dataSources.length; i += 1) {
      const dataSource = dataSources[i];
      // Note: Not all dataSources and their entities have labels
      if (dataSource.entities && dataSource.entities.values.length > 0 && dataSource.entities.values[0].label) {
        for (let j = 0; j < dataSource.entities.values.length; j += 1) {
          const entity: any = dataSource.entities.values[j];
          entity.label.show = isVisible; // Toggle labels based on 'isVisible'
        }
      }
    }
  }

  atLeastMoreThanOneDataSourcesHaveLabels(dataSources: Cesium.DataSource[]) {
    // Only show the 'Toggle All Labels' button when there are more than 1 datasources with labels
    let dataSourceWithLabelsCount = 0;
    for (let i = 0; i < dataSources.length; i += 1) {
      const dataSource = dataSources[i];
      // Note: Not all dataSources and their entities have labels
      if (dataSource.entities && dataSource.entities.values.length > 0 && dataSource.entities.values[0].label) {
        dataSourceWithLabelsCount += 1;
      }
      if (dataSourceWithLabelsCount > 1) {
        return true;
      }
    }
    return false;
  }

  addDataSource(layerName?) {
    // 1. Initialise dataSource name and create dataSource
    const newLayerCount = this.cesiumDataSourceCount + 1;
    let newDataSourceName = 'Layer ' + newLayerCount;
    if (layerName) {
      newDataSourceName = layerName;
    }
    let dataSource = this.cesiumService.getDataSource(this.cesiumViewer, newDataSourceName);
    if (!dataSource) {
      dataSource = this.cesiumService.createDataSource(this.cesiumViewer, newDataSourceName);
      dataSource.show = true; // Set 'dataSource.show' to true as default on create

      // 2. Update 'this.cesiumDataSources'
      this.cesiumDataSources.push(dataSource);
      this.cesiumDataSourceCount += 1;
    }

    // Initialise clustering and options // TODO
    // dataSource.clustering.enabled = false;
    // dataSource.clustering.pixelRange = 5;
    // dataSource.clustering.minimumClusterSize = 2;
    // dataSource.clustering.clusterBillboards = true;
    // dataSource.clustering.clusterLabels = true;
    // dataSource.clustering.clusterPoints = true;
    // dataSource.clustering.clusterEvent.addEventListener((entities, cluster) => {
    //   cluster.label.show = true;
    //   cluster.label.text = entities.length.toLocaleString();
    // });

    return dataSource;
  }

  private addDataSourceAndSetAsActive() {
    const dataSource = this.addDataSource();
    this.updateActiveDataSource(dataSource);
  }

  removeDataSource(dataSource: Cesium.DataSource) {
    const index = this.cesiumDataSources.indexOf(dataSource);
    if (index !== -1) {
      this.cesiumDataSources.splice(index, 1);
      this.cesiumViewer.dataSources.remove(dataSource, true);
      if (this.activeDataSource === dataSource) {
        this.cesiumViewer.dataSources.get(0);
        this.updateActiveDataSource(this.cesiumViewer.dataSources.get(0));
      }
    }
  }

  updateActiveDataSource(dataSource: Cesium.DataSource) {
    if (this.activeDataSource !== dataSource) {
      // 1. Update 'this.activeDataSource'
      this.activeDataSource = dataSource;

      // 2. Update 'this.cesiumDrawingToolsProperties.activeDataSource' and set all other
      // dataSources to inactive
      this.cesiumDrawingToolsProperties.activeDataSource = this.activeDataSource;
      for (let i = 0; i < this.cesiumDrawingToolsProperties.drawingTools.length; i += 1) {
        this.cesiumDrawingToolsProperties.drawingTools[i].isActivated = false;
      }
    }
  }

  showEditDataSourceNameDialog(dataSource: Cesium.DataSource) {
    this.displayEditDataSourceDialog = true;
    this.editableDataSource = dataSource;
    this.editableDataSourceName = dataSource.name;
  }

  validateEditableDataSourceName(event) {
    const updatedDataSourceName = event.target.value;

    // 1. Check for duplicate layer name
    const index = this.cesiumDataSources.findIndex(
      (dataSource) => {
        return (dataSource.name === updatedDataSourceName);
      },
    );
    if (index !== -1 && (updatedDataSourceName !== this.editableDataSourceName)) {
      this.hasDuplicateDataSourceName = true;
    } else {
      this.hasDuplicateDataSourceName = false;
    }

    // 2. Check for empty layer name
    if (updatedDataSourceName.length === 0) {
      this.isInvalidDataSourceName = true;
    } else {
      this.isInvalidDataSourceName = false;
    }
  }

  clickSaveEditableDataSourceNameButton(event) {
    if (event.keyCode === 13) {
      const buttonElement = <HTMLInputElement>document.getElementById('dialog-save-datasource-name-button');
      if (buttonElement) {
        buttonElement.click();
      }
    }
  }

  saveEditableDataSourceName(dataSource: Cesium.DataSource) {
    const inputElement = <HTMLInputElement>document.getElementById('dialog-edit-datasource-name-input');
    const updatedDataSourceName = inputElement.value;

    let index = this.cesiumDataSources.indexOf(dataSource);
    if (index !== -1) {
      this.cesiumDataSources[index].name = updatedDataSourceName;
    }

    index = this.cesiumViewer.dataSources.indexOf(dataSource);
    if (index !== -1) {
      this.cesiumViewer.dataSources.get(index).name = updatedDataSourceName;
    }
  }

  saveCanvasAsImage() {
    this.cesiumService.saveCanvasAsImage(this.cesiumViewer);
  }

  exportDataSourceAsGeoJson(dataSource: Cesium.DataSource) {
    this.cesiumService.exportDataSourceAsGeoJson(dataSource);
  }

  importDataSourceFromGeoJson() {
    const fileLayerUploadElement = document.getElementById('file-layer-upload');
    if (fileLayerUploadElement) {
      fileLayerUploadElement.click();
    }
  }

  handleFileLayerUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.addEventListener('load', () => { // Workaround to get file.fileName and file dataURI together
        const fileDataURI = reader.result;
        const newDataSource = this.addDataSource();
        const promise = Cesium.GeoJsonDataSource.load(fileDataURI);
        promise.then((uploadedDataSource) => {
          const cesiumJulianDate = Cesium.JulianDate.fromDate(new Date());
          if (uploadedDataSource.entities) {
            const entities = uploadedDataSource.entities.values;
            // console.log(entities);

            let newEntityCount = 0; // Used for file imports that have no 'properties' (i.e. Not exported from IOC)
            for (let i = 0; i < entities.length; i += 1) {
              const entity = entities[i];
              // console.log(entity);

              if (entity.properties.id) {
                const newEntityId = entity.properties.id.getValue(cesiumJulianDate);
                const newEntity = newDataSource.entities.getOrCreateEntity(newEntityId);
                if (entity.properties.billboard) {
                  // console.log('BILLBOARD');
                  newEntity.name = entity.properties.name.getValue(cesiumJulianDate);
                  newEntity.position = entity.position.getValue(cesiumJulianDate);
                  newEntity.billboard = entity.properties.billboard.getValue(cesiumJulianDate);
                  newEntity.label = entity.properties.label.getValue(cesiumJulianDate);
                } else if (entity.properties.polyline) {
                  // console.log('POLYLINE');
                  newEntity.name = entity.properties.name.getValue(cesiumJulianDate);
                  newEntity.position = entity.polyline.positions.getValue(cesiumJulianDate)[0];
                  newEntity.polyline = entity.properties.polyline.getValue(cesiumJulianDate);
                  // Workaround to get 'material' property
                  const material = entity.properties.polyline.getValue(cesiumJulianDate).material;
                  const red = material.color.red;
                  const green = material.color.green;
                  const blue = material.color.blue;
                  const alpha = material.color.alpha;
                  newEntity.polyline.material = new Cesium.Color(red, green, blue, alpha);
                  newEntity.label = entity.properties.label.getValue(cesiumJulianDate);
                } else if (entity.properties.polygon) {
                  // console.log('POLYGON');
                  newEntity.name = entity.properties.name.getValue(cesiumJulianDate);
                  const center = Cesium.BoundingSphere.fromPoints(
                    entity.polygon.hierarchy.getValue(cesiumJulianDate).positions).center; // Note: Have to use
                                                                                           // .positions for non-cesium
                                                                                           // exported files
                  Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
                  newEntity.position = new Cesium.ConstantPositionProperty(center);
                  newEntity.polygon = entity.properties.polygon.getValue(cesiumJulianDate);
                  // Workaround to get 'material' property
                  const material = entity.properties.polygon.getValue(cesiumJulianDate).material;
                  const red = material.color.red;
                  const green = material.color.green;
                  const blue = material.color.blue;
                  const alpha = material.color.alpha;
                  newEntity.polygon.material = new Cesium.Color(red, green, blue, alpha);
                  newEntity.label = entity.properties.label.getValue(cesiumJulianDate);
                } else if (entity.properties.ellipse) {
                  // console.log('ELLIPSE');
                  newEntity.name = entity.properties.name.getValue(cesiumJulianDate);
                  newEntity.position = entity.position.getValue(cesiumJulianDate);
                  newEntity.ellipse = entity.properties.ellipse.getValue(cesiumJulianDate);
                  // Workaround to get 'material' property
                  const material = entity.properties.ellipse.getValue(cesiumJulianDate).material;
                  const red = material.color.red;
                  const green = material.color.green;
                  const blue = material.color.blue;
                  const alpha = material.color.alpha;
                  newEntity.ellipse.material = new Cesium.Color(red, green, blue, alpha);
                  newEntity.label = entity.properties.label.getValue(cesiumJulianDate);
                }
              } else {
                newEntityCount += 1;
                const newEntityId = 'New-Entity-' + (newEntityCount);
                const newEntity = newDataSource.entities.getOrCreateEntity(newEntityId);
                if (entity.billboard) {
                  // console.log('BILLBOARD');
                  newEntity.name = newEntityId;
                  newEntity.position = entity.position.getValue(cesiumJulianDate);
                  newEntity.billboard = new Cesium.BillboardGraphics({
                    image: new Cesium.ConstantProperty('assets/markers/marker-white.png'),
                    height: 40,
                    width: 40,
                    color: Cesium.Color.RED,
                  });
                  newEntity.label = new Cesium.LabelGraphics({
                    text: new Cesium.ConstantProperty(newEntity.name),
                    font: '12pt Lucida Sans',
                    style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 1,
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    // verticalOrigin: Property,
                    eyeOffset: new Cesium.Cartesian3(0, 0, -1),
                    pixelOffset: new Cesium.Cartesian2(20, 0),
                    // scale: Property,
                    show: true,
                    // translucencyByDistance: Property,
                    // pixelOffsetScaleByDistance: Property,
                  });
                } else if (entity.polyline) {
                  // console.log('POLYLINE');
                  newEntity.name = newEntityId;
                  newEntity.position = entity.polyline.positions.getValue(cesiumJulianDate)[0];
                  newEntity.polyline = new Cesium.PolylineGraphics({
                    positions: entity.polyline.positions.getValue(cesiumJulianDate),
                    material: Cesium.Color.RED,
                    width: 3,
                  });
                  newEntity.label = new Cesium.LabelGraphics({
                    text: new Cesium.ConstantProperty(newEntity.name),
                    font: '12pt Lucida Sans',
                    style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 1,
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    // verticalOrigin: Property,
                    eyeOffset: new Cesium.Cartesian3(0, 0, -1),
                    pixelOffset: new Cesium.Cartesian2(20, 0),
                    // scale: Property,
                    show: true,
                    // translucencyByDistance: Property,
                    // pixelOffsetScaleByDistance: Property,
                  });
                } else if (entity.polygon) {
                  // console.log('POLYGON');
                  newEntity.name = newEntityId;
                  const center = Cesium.BoundingSphere.fromPoints(
                    entity.polygon.hierarchy.getValue(cesiumJulianDate).positions).center; // Note: Have to use
                                                                                           // .positions for non-cesium
                                                                                           // exported files
                  Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
                  newEntity.position = new Cesium.ConstantPositionProperty(center);
                  newEntity.polygon = new Cesium.PolygonGraphics({
                    hierarchy: entity.polygon.hierarchy.getValue(cesiumJulianDate),
                    material: new Cesium.Color(1.0, 0.0, 0.0, 0.4),
                  });
                  newEntity.label = new Cesium.LabelGraphics({
                    text: new Cesium.ConstantProperty(newEntity.name),
                    font: '12pt Lucida Sans',
                    style: new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE),
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 1,
                    horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.CENTER),
                    verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.CENTER),
                    eyeOffset: new Cesium.Cartesian3(0, 0, -1),
                    // pixelOffset: new Cesium.Cartesian2(20, 0),
                    // scale: Property,
                    show: true,
                    // translucencyByDistance: Property,
                    // pixelOffsetScaleByDistance: Property,
                  });
                } // Note: Currently Ellipse not supported for non-Cesium exported files
              }
            }
          }
        }, (errorMsg) => {
          console.log(errorMsg); // Error!
        });
      }, false);
      reader.readAsDataURL(file);
    }
  }

  handleFileUploadToEntity(event: any, cesiumEntity: Cesium.Entity) {
    if (event.target.files && event.target.files[0]) {
      for (let i = 0; i < event.target.files.length; i += 1) {
        const reader = new FileReader();
        const file = event.target.files[i];

        reader.addEventListener('load', () => {
          const fileName = file.name;
          const type = file.type;
          const fileType = type.split('/')[0];
          const fileExtension = type.split('/')[1];
          // const fileDataURI = this.sanitizer.bypassSecurityTrustResourceUrl(this.result); //
          // Note: DataURI is too slow to load for big files
          const fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)); // Much more
                                                                                                    // optimized
                                                                                                    // compared to
                                                                                                    // dataURI
          const uploadedContent = {
            fileName, // Return object shorthand
            fileType,
            fileExtension,
            // fileDataURI,
            fileURL,
          };
          cesiumEntity.customProperties.uploadedContentList.unshift(uploadedContent);
        }, false);

        if (file) {
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeFileUploadFromEntity(uploadedContent: any, cesiumEntity: Cesium.Entity) {
    const index = cesiumEntity.customProperties.uploadedContentList.indexOf(uploadedContent);
    if (index > -1) {
      cesiumEntity.customProperties.uploadedContentList.splice(index, 1);
    }
  }

  updateEntityIcon(icon: any) {
    this.cesiumDrawingToolsProperties.selectedIcon = icon.iconUrl;
    this.cesiumService.updateEntityIcon(this.cesiumDrawingToolsProperties);
  }

  updateEntityColor() {
    this.cesiumService.updateEntityColor(this.cesiumDrawingToolsProperties);
  }
    /*-----------------------------------------------------------------------------------
   Static DataSources / Overlays
   -----------------------------------------------------------------------------------*/
   private initStaticDataSources() {
    this.loadMapLayerService.initLayers(this.cesiumViewer, this.cesiumDataSources);
  }
 

  /*-----------------------------------------------------------------------------------
   Dynamic DataSources / Overlays
   -----------------------------------------------------------------------------------*/
  private initDynamicDataSources() {
    // this.initBFTDataSource();
    this.loadMapLayerService.initAirTracks(this.cesiumViewer, this.cesiumDynamicDataSources);
  }

  // publishDataSource(dataSource: Cesium.DataSource) {
  //   // TODO: Check for duplicate names in existing published datasources
  //   // Solution: Currently appends current date-time to ensure uniqueness
  //   // Will only have issues if 2 users publish exact same datasource at exact same timing
  //   const currDateTimestamp = moment(new Date()).format('YYYYMMDD-hhmmss');
  //   const publishedDataSource = new Cesium.CustomDataSource(dataSource.name + ' - ' + '[' + currDateTimestamp + ']');

  //   const cesiumJulianDate = Cesium.JulianDate.fromDate(new Date());
  //   const entities: any = dataSource.entities.values;
  //   for (let i = 0; i < entities.length; i += 1) {
  //     const entity = entities[i];

  //     const clonedEntityId = publishedDataSource.name + ' - ' + entity.name;
  //     const clonedEntity: any = publishedDataSource.entities.getOrCreateEntity(clonedEntityId);
  //     clonedEntity.name = entity.name; // Initialise 'name'
  //     clonedEntity.position = entity.position; // Initialise 'position'
  //     if (entity.billboard) { // Billboard
  //       clonedEntity.billboard = { // Initialise 'billboard'
  //         image: entity.billboard.image.getValue(cesiumJulianDate),
  //         height: entity.billboard.height.getValue(cesiumJulianDate),
  //         width: entity.billboard.width.getValue(cesiumJulianDate),
  //         color: entity.billboard.color.getValue(cesiumJulianDate),
  //       };
  //     } else if (entity.polyline) { // Polyline
  //       clonedEntity.polyline = {  // Initialise 'polyline'
  //         positions: entity.polyline.positions.getValue(cesiumJulianDate),
  //         material: entity.polyline.material.getValue(cesiumJulianDate),
  //         width: entity.polyline.width.getValue(cesiumJulianDate),
  //       };
  //     } else if (entity.polygon) { // Polygon
  //       clonedEntity.polygon = {  // Initialise 'polygon'
  //         hierarchy: entity.polygon.hierarchy.getValue(cesiumJulianDate),
  //         material: entity.polygon.material.getValue(cesiumJulianDate),
  //       };
  //     } else if (entity.ellipse) { // Ellipse
  //       clonedEntity.ellipse = {  // Initialise 'ellipse'
  //         semiMinorAxis: entity.ellipse.semiMinorAxis.getValue(cesiumJulianDate),
  //         semiMajorAxis: entity.ellipse.semiMajorAxis.getValue(cesiumJulianDate),
  //         height: entity.ellipse.height.getValue(cesiumJulianDate),
  //         material: entity.ellipse.material.getValue(cesiumJulianDate),
  //       };
  //     }
  //     clonedEntity.label = { // Initialise 'label'
  //       text: entity.label.text.getValue(cesiumJulianDate),
  //       font: entity.label.font.getValue(cesiumJulianDate),
  //       style: entity.label.style.getValue(cesiumJulianDate),
  //       fillColor: entity.label.fillColor.getValue(cesiumJulianDate),
  //       outlineColor: entity.label.outlineColor.getValue(cesiumJulianDate),
  //       outlineWidth: entity.label.outlineWidth.getValue(cesiumJulianDate),
  //       horizontalOrigin: entity.label.horizontalOrigin.getValue(cesiumJulianDate),
  //       verticalOrigin: entity.label.verticalOrigin.getValue(cesiumJulianDate),
  //       eyeOffset: entity.label.eyeOffset.getValue(cesiumJulianDate),
  //       pixelOffset: entity.label.pixelOffset.getValue(cesiumJulianDate),
  //       // scale: entity.label.scale.getValue(cesiumJulianDate),
  //       show: entity.label.show.getValue(cesiumJulianDate),
  //       // translucencyByDistance: entity.label.translucencyByDistance.getValue(cesiumJulianDate),
  //       // pixelOffsetScaleByDistance:
  //       // entity.label.pixelOffsetScaleByDistance.getValue(cesiumJulianDate),
  //     };

  //     // Custom properties
  //     clonedEntity.customProperties = {
  //       uploadedContentList: [],
  //     };
  //     for (let j = 0; j < entity.customProperties.uploadedContentList.length; j += 1) {
  //       clonedEntity.customProperties.uploadedContentList.push(entity.customProperties.uploadedContentList[j]);
  //     }
  //   }

  //   this.cesiumViewer.dataSources.add(publishedDataSource);
  //   this.cesiumPublishedDataSources.push(publishedDataSource);

  //   // TODO: Broadcast new published datasource
  // }

  /*-----------------------------------------------------------------------------------
   Published DataSources / Overlays
   -----------------------------------------------------------------------------------*/
  // private initPublishedDataSources() {
  //   this.cesiumPublishedDataSources = []; // TODO: Init/Get all published datasources from DB
  // }









}
