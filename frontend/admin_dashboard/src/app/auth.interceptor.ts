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

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    // Get the ID token from Firebase
    return from(user.getIdToken()).pipe(
      switchMap((idToken) => {
        // Clone the request and add the Authorization header
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        return next(clonedReq);
      })
    );
  } else {
    // If no user is logged in, proceed without adding a token
    return next(req);
  }
};
