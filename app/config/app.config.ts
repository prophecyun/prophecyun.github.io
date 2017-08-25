import { Injectable } from '@angular/core';

@Injectable()
export class AppConfigService {

    SG_BOUNDARY_VECTOR_URL: string;
    SG_DISTRICT_VECTOR_URL: string;
    SG_MRT_LINES_VECTOR_URL: string;
    SG_MRT_STATIONS_VECTOR_URL: string;
    SG_POP_VECTOR_URL: string;

    FIR_VECTOR_URL: string;
    RESTRICTED_AIRSPACE_URL: string;
    RUNWAYS_URL: string;
    DRONE_RESTRICTION_URL: string;
    AIRWAY_URL: string
    
    MOH_CHAS_CLINIC_URL: string;
    NPC_BOUNDARY_URL: string;
    SPF_NPP_URL: string;
    TOURISM_URL: string;

    OSMDARK: string;
    OSMLIGHT: string;
    OSMVECTOR: string;
    GOOGLE: string;
    GOOGLESAT: string;
    
    HOME_LAT: number;
    HOME_LONG: number;
    HOME_ZOOM: number;

    CIMS_BASE: string;
    IVSG_URL: string;
    BFT_URL: string;
    ORBAT_URL: string;
    FOLDERS_URL: string;
    INCIDENTS_URL: string; 
    FILE_UPDATE_URL: string;
    TASK_URL: string;

    constructor() {
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
        this.INCIDENTS_URL = this.CIMS_BASE + 'incidents/' ;
        this.FILE_UPDATE_URL = this.CIMS_BASE + 'fileupdates/'; //followed by updateId
        this.TASK_URL = this.CIMS_BASE + '/task/incident/'; //followed by IncidentId
    }
}