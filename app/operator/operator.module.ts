import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpModule } from '@angular/http'
import { MaterialModule } from '@angular/material'
import { FormsModule} from '@angular/forms'

import { OperatorLayout } from './operator.layout'
import { OperatorControlComponent } from './operator.control.component'


import { GoogleMapService } from '../services/map.google.service'
import { AppConfigService } from '../config/app.config';



@NgModule({

    imports: [
        BrowserModule,
        HttpModule,
        MaterialModule.forRoot(),
        FormsModule
    ],
    
    declarations: [
        OperatorLayout, 
        OperatorControlComponent],
    
    exports: [],

    providers: [

        AppConfigService,

        GoogleMapService],

    bootstrap: [OperatorLayout]
})
export class OperatorModule { }