import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {ErrorResponse} from '../models/error-response.model';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let err: ErrorResponse;

      if (error.error && typeof error.error === 'object') {
        err = error.error as ErrorResponse;
      } else {
        err = {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Error desconocido',
          path: req.url,
          timestamp: new Date().toISOString(),
        };
      }

      console.error('[API ERROR]', err);
      return throwError(() => err);
    })
  );
};
