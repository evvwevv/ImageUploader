import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {SharingImageData} from './sharingImageData'
import { ImageData } from './imageData'

@Injectable({
  providedIn: 'root'
})
export class StoreImageService {
  private storeUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/assoctagsanduserinfo'

  private shareUrl = "https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/addordeletepermissionforusertoviewimage"

  constructor(private http: HttpClient) { }

  post(imageData: ImageData) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });

    return this.http
      .post<ImageData>(this.storeUrl, imageData)
      .pipe(catchError(this.handleError));
  }

  private handleError(res: HttpErrorResponse | any) {
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server error');
  }

  shareWithUser(imageData: SharingImageData) {
    console.log(imageData.userToAddOrDeletePermission);
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return this.http
      .post<SharingImageData>(this.shareUrl, imageData)
      .pipe(catchError(this.handleError));
  }
}
