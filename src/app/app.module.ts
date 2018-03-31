/* Libraries */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { VerticalTimelineModule } from 'angular-vertical-timeline';
import { PrimengModule } from './module/primeng.module';
import { MaterialModule } from './module/material.module';
import { StompRService } from '@stomp/ng2-stompjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AmazingTimePickerModule } from 'amazing-time-picker'; 
/* Services */
import { CesiumService } from './service/cesium.service';
import { SocketWebService } from './service/web/socket.web.service';
import { ClientWebService } from './service/web/client.web.service';
import { LoadMapLayerService } from './service/loadMapLayer.service';

/* Components */
import { AppComponent } from './app.component';
import { AppRoutingModule } from './module/routing.module';
import { OperatorComponent } from './component/operator/operator.component';
import { TopBarComponent } from './component/operator/top-bar/top-bar.component';
import { MainPanelComponent } from './component/operator/main-panel/main-panel.component';
import { ClockComponent } from './component/operator/top-bar/clock/clock.component';
import { AppMapComponent } from './component/operator/main-panel/map/map.component';


/* Config */
import { AppConfig } from './config/app.config';
import { IconConfig } from './config/icon.config';

@NgModule({
  declarations: [
    AppComponent,
    ClockComponent,
    OperatorComponent,
    TopBarComponent,
    MainPanelComponent,
    AppMapComponent,
  ],
  entryComponents: [

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    FlexLayoutModule,
    VerticalTimelineModule,
    PrimengModule,
    MaterialModule,
    NgxDatatableModule,
    AmazingTimePickerModule,
  ],
  providers: [
    AppConfig,
    IconConfig,
    CesiumService,
    SocketWebService,
    ClientWebService,
    LoadMapLayerService,
    StompRService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
