import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/observable';
@Injectable()
export class InterceptorService implements HttpInterceptor {
  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      // headers: req.headers.set('upgrade-insecure-requests', '1')
      
      // headers: req.headers.set('method', 'GET')
    });
    return next.handle(authReq);
  }
}
