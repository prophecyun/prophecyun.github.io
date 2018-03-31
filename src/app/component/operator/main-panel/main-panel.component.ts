import { Component, AfterViewInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { CesiumService } from '../../../service/cesium.service';
import { LoadMapLayerService } from '../../../service/loadMapLayer.service';
import { SocketWebService } from '../../../service/web/socket.web.service';
import { MessageService } from 'primeng/components/common/messageservice';

import * as convert from 'xml-js';
import * as ontime from 'ontime';
import * as moment from 'moment';



@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css'],
  providers: [MessageService],
})
export class MainPanelComponent implements AfterViewInit {


  constructor(private cesiumService: CesiumService, private bftService: LoadMapLayerService,
    private http: HttpClient, private sanitizer: DomSanitizer,
    private socketService: SocketWebService, private messageService: MessageService, ) {
  }

  ngAfterViewInit() {
  }



}
