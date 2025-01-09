import { Injectable } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';


export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = getAuth();
  const apiUrl = environment.apiUrl;

  // console.log('Intercepting request:', req.url);

  if (req.url.startsWith(apiUrl)) {
    return new Observable((observer) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe(); // Stop listening once the state is resolved
        if (user) {
          try {
            const idToken = await user.getIdToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${idToken}`,
              },
            });
            next(clonedReq).subscribe(observer);
          } catch (error) {
            console.error('Error fetching ID token:', error);
            next(req).subscribe(observer); // Proceed without token on error
          }
        } else {
          next(req).subscribe(observer); // Proceed without token if no user
        }
      });
    });
  }

  // Proceed if the URL doesn't match the API URL
  return next(req);
};
