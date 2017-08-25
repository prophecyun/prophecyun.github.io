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
var AppConfigService = (function () {
    function AppConfigService() {
        this.SG_BOUNDARY_VECTOR_URL = '../data/geojson/SG.geojson';
        this.SG_DISTRICT_VECTOR_URL = '../data/geojson/choropleth.geojson';
        this.SG_MRT_LINES_VECTOR_URL = '../data/geojson/mrt_lines.geojson';
        this.SG_MRT_STATIONS_VECTOR_URL = '../data/geojson/mrt_stations.geojson';
        this.SG_POP_VECTOR_URL = '../data/geojson/population.geojson';
        this.FIR_VECTOR_URL = '../data/geojson/FIR_ICAO_2009.geojson'; //FIR_ICAO_2009
        this.RESTRICTED_AIRSPACE_URL = '../data/geojson/restrictedAirspace_A.geojson';
        this.RUNWAYS_URL = '../data/geojson/runway_l.geojson';
        this.DRONE_RESTRICTION_URL = '../data/geojson/drone_A.geojson';
        this.AIRWAY_URL = '../data/geojson/airways_sg.geojson';
        this.MOH_CHAS_CLINIC_URL = '../data/kml/MOH_CHAS_CLINICS.kml';
        this.NPC_BOUNDARY_URL = '../data/kml/NPC_BOUNDARY.kml';
        this.SPF_NPP_URL = '../data/kml/SPF_Establishment.kml';
        this.TOURISM_URL = '../data/kml/TOURISM.kml';
        // this.OSMDARK = "http://localhost:8080/maps/osm/tile/dark/{z}/{x}/{y}.png";
        this.OSMDARK = "http://localhost:8080/maps/osm_full/osm/{z}/{x}/{y}.png";
        this.OSMLIGHT = "http://localhost:8080/maps/osm/tile/light/{z}/{x}/{y}.png";
        this.GOOGLE = "http://localhost:8080/maps/google/{z}/{x}/{y}.png";
        this.GOOGLESAT = "http://localhost:8080/maps/satmap/{z}/{x}/{y}.jpg";
        this.OSMVECTOR = "http://localhost:8080/maps/osm/vector/singapore/";
        this.HOME_LAT = 1.36;
        this.HOME_LONG = 103.82;
        this.HOME_ZOOM = 16;
        this.CIMS_BASE = "http://localhost:8080/CimsOps/";
        this.IVSG_URL = this.CIMS_BASE + 'ivsg/retrieveCameras';
        this.BFT_URL = this.CIMS_BASE + 'bft';
        this.ORBAT_URL = this.CIMS_BASE + 'bft/orbat';
        this.FOLDERS_URL = this.CIMS_BASE + 'folders';
        this.INCIDENTS_URL = this.CIMS_BASE + 'incidents/';
        this.FILE_UPDATE_URL = this.CIMS_BASE + 'fileupdates/'; //followed by updateId
        this.TASK_URL = this.CIMS_BASE + '/task/incident/'; //followed by IncidentId
    }
    return AppConfigService;
}());
AppConfigService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], AppConfigService);
exports.AppConfigService = AppConfigService;
//# sourceMappingURL=app.config.js.map