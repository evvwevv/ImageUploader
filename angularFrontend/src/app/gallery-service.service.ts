import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(private http: HttpClient) { }

  getImage(imageUrl: string): Observable<Blob> {
    console.log(imageUrl);
    return this.http.get(imageUrl, { responseType: 'blob' });
  }
}
