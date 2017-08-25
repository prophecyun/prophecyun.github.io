import { Component, OnInit } from '@angular/core';
import { GoogleMapService } from '../services/map.google.service'

@Component({
    selector: 'operator-app',
    template: `
        <div class="left">
            <div id="map"></div>
        </div>
        
        <div class="right">
            <ul class="tab">
                <li><a href="javascript:void(0)" class="tablinks" (click)="clickTab('tab1')"><h2> Controls </h2></a></li>
            </ul>
            <div *ngIf="tab==='tab1'" id="controls" class="tabcontent">
                <control-panel></control-panel>
            </div>
        </div>

        <div id="latlon"></div>
        `,
    styleUrls: ['app/operator/operator.css']
})
export class OperatorLayout {

    private tab = "tab1";
    private lat: number;
    private lon: number;

    constructor(
        // private mapService: OpenlayersMapService,
        private googleMapService: GoogleMapService
        ) { };

    ngOnInit(): void {
        // this.mapService.init();
        this.googleMapService.init();

    }

    clickTab(itab:string) : void{ 
        // console.log("clicked ", itab);
        this.tab = itab;
    }
}