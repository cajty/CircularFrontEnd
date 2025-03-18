import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, throwError } from 'rxjs';
import {ToastService} from '../services/toast/toast.service';
import {ErrorResponse} from '../../models/error';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        errorMessage = getErrorMessage(error);
      }

      // Display error notification
      toastService.error(errorMessage, 'Error');

      // Log the full error to console for debugging
      console.error('API Error:', error);

      // Return a throwable error for the application to handle
      return throwError(() => new Error(errorMessage));
    })
  );
};

/**
 * Extracts the most appropriate error message from the error response
 */
function getErrorMessage(error: HttpErrorResponse): string {
  // Try to parse the error as our ErrorResponse type
  const serverError = error.error as ErrorResponse;

  // Check if we have a structured error response from our API
  if (serverError && typeof serverError === 'object') {
    // First, check for validation errors
    if (serverError.validationErrors && Object.keys(serverError.validationErrors).length > 0) {
      // Get the first validation error message
      const firstErrorField = Object.keys(serverError.validationErrors)[0];
      return serverError.validationErrors[firstErrorField];
    }

    // Then check for custom error message
    if (serverError.message) {
      return serverError.message;
    }

    // Fall back to error code if present
    if (serverError.errorCode) {
      // Format error code to be more readable
      return serverError.errorCode.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
    }
  }

  // If we can't extract a custom message, use HTTP status code fallbacks
  return getStatusCodeMessage(error.status);
}


function getStatusCodeMessage(status: number): string {
  switch (status) {
    case 400: return 'Bad request: please verify your input';
    case 401: return 'Unauthorized: please log in again';
    case 403: return 'Forbidden: you do not have permission to access this resource';
    case 404: return 'Resource not found';
    case 409: return 'Conflict with an existing resource';
    case 422: return 'Validation error: please check your input';
    case 500: return 'Internal server error: our team has been notified';
    case 503: return 'Service unavailable: please try again later';
    default: return `Server error (${status}): please try again later`;
  }
}
