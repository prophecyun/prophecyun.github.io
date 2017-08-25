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
// import { OpenlayersMapService } from '../services/map.openlayer.service'
var map_google_service_1 = require("../services/map.google.service");
var OperatorControlComponent = (function () {
    function OperatorControlComponent(mapService) {
        this.mapService = mapService;
    }
    ;
    OperatorControlComponent.prototype.ngOnInit = function () {
        this.osmMapType = false;
        this.firLayer = true;
        this.restrictedAirspaceLayer = true;
        this.runwayLayer = true;
        this.droneRestrictionLayer = true;
        this.airwayLayer = true;
    };
    OperatorControlComponent.prototype.toggleFIR = function () {
        this.mapService.toggleLayerVisibility("FIR", this.firLayer);
    };
    OperatorControlComponent.prototype.toggleRestrictedAirspace = function () {
        this.mapService.toggleLayerVisibility("RestrictedAirspace", this.restrictedAirspaceLayer);
    };
    OperatorControlComponent.prototype.toggleRunway = function () {
        this.mapService.toggleLayerVisibility("Runway", this.runwayLayer);
    };
    OperatorControlComponent.prototype.toggleDroneRestriction = function () {
        this.mapService.toggleLayerVisibility("DroneRestriction", this.droneRestrictionLayer);
    };
    OperatorControlComponent.prototype.toggleAirway = function () {
        this.mapService.toggleLayerVisibility("Airway", this.airwayLayer);
    };
    return OperatorControlComponent;
}());
OperatorControlComponent = __decorate([
    core_1.Component({
        selector: 'control-panel',
        templateUrl: 'app/operator/operator.control.component.html',
        inputs: [],
        styleUrls: ['app/operator/operator.control.component.css']
    }),
    __metadata("design:paramtypes", [map_google_service_1.GoogleMapService])
], OperatorControlComponent);
exports.OperatorControlComponent = OperatorControlComponent;
//# sourceMappingURL=operator.control.component.js.map