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
var map_google_service_1 = require("../services/map.google.service");
var OperatorLayout = (function () {
    function OperatorLayout(
        // private mapService: OpenlayersMapService,
        googleMapService) {
        this.googleMapService = googleMapService;
        this.tab = "tab1";
    }
    ;
    OperatorLayout.prototype.ngOnInit = function () {
        // this.mapService.init();
        this.googleMapService.init();
    };
    OperatorLayout.prototype.clickTab = function (itab) {
        // console.log("clicked ", itab);
        this.tab = itab;
    };
    return OperatorLayout;
}());
OperatorLayout = __decorate([
    core_1.Component({
        selector: 'operator-app',
        template: "\n        <div class=\"left\">\n            <div id=\"map\"></div>\n        </div>\n        \n        <div class=\"right\">\n            <ul class=\"tab\">\n                <li><a href=\"javascript:void(0)\" class=\"tablinks\" (click)=\"clickTab('tab1')\"><h2> Controls </h2></a></li>\n            </ul>\n            <div *ngIf=\"tab==='tab1'\" id=\"controls\" class=\"tabcontent\">\n                <control-panel></control-panel>\n            </div>\n        </div>\n\n        <div id=\"latlon\"></div>\n        ",
        styleUrls: ['app/operator/operator.css']
    }),
    __metadata("design:paramtypes", [map_google_service_1.GoogleMapService])
], OperatorLayout);
exports.OperatorLayout = OperatorLayout;
//# sourceMappingURL=operator.layout.js.map