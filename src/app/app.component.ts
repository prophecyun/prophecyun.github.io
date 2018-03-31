import { Component } from '@angular/core';

// import { AppConfig } from './config/app.config';
// import { SocketWebService } from './service/web/socket.web.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  constructor() {
    // this.socketWebService.init();
  }
}
