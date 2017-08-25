import { Component, Input } from '@angular/core';
// import { OpenlayersMapService } from '../services/map.openlayer.service'
import { GoogleMapService } from '../services/map.google.service'

@Component({
    selector: 'control-panel',
    templateUrl: 'app/operator/operator.control.component.html',
    inputs: [],
    styleUrls: ['app/operator/operator.control.component.css']
})
export class OperatorControlComponent {

    constructor(private mapService: GoogleMapService) {
    };

    // private mapType: string =  "roadmap";
    private osmMapType: boolean;
    private firLayer: boolean;
    private restrictedAirspaceLayer: boolean;
    private runwayLayer: boolean;
    private droneRestrictionLayer: boolean;
    private airwayLayer: boolean;

    ngOnInit(): void {
        this.osmMapType = false;
        this.firLayer = true;
        this.restrictedAirspaceLayer = true;
        this.runwayLayer = true;
        this.droneRestrictionLayer = true;
        this.airwayLayer = true;
    }

    private toggleFIR(): void {
        this.mapService.toggleLayerVisibility("FIR", this.firLayer);
    }

    private toggleRestrictedAirspace(): void {
        this.mapService.toggleLayerVisibility("RestrictedAirspace", this.restrictedAirspaceLayer);
    }

    private toggleRunway(): void {
        this.mapService.toggleLayerVisibility("Runway", this.runwayLayer);
    }
    
    private toggleDroneRestriction(): void {
        this.mapService.toggleLayerVisibility("DroneRestriction", this.droneRestrictionLayer);
    }

    private toggleAirway(): void{
        this.mapService.toggleLayerVisibility("Airway", this.airwayLayer);
    }
}