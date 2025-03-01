import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = error.error instanceof ErrorEvent
        ? error.error.message
        : getServerErrorMessage(error);

      // Show toast notification
      toastrService.error(errorMessage, 'Error');

      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};

function getServerErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 404: return 'Resource not found';
    case 400: return 'Bad request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 500: return 'Internal server error';
    default: return `Error: ${error.message}`;
  }
}
