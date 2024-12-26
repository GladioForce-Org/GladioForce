import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  public parseError(error: HttpErrorResponse): string {
    if (error.error) { // Check if error.error exists
      try {
        console.log("parsing");
        const parsedError = JSON.parse(JSON.stringify(error.error)); // Try to parse it as JSON
        return parsedError.error || parsedError.message || "An error occurred."; // Access error or message property
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        return "An error occurred."; // Fallback message
      }
    } else {
      return 'An unknown error occurred.'; // Generic fallback
    }
  }
}
