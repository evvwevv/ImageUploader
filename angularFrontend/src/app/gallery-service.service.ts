import { Injectable } from '@angular/core';
import { Observable, throwError as observableThrowError} from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Response } from '@angular/http';
import {AuthService} from './auth/auth.service';
import {GalleryImage} from './galleryImage';
import {catchError, map} from 'rxjs/operators';
import { ImageData } from './imageData'


@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private getAllImagesUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/getuserimages';
  private deleteImagesUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/actuallydeleteimage';
  private s3URL = 'https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/';
  private categorySearchUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/searchimagebycategoryanduser'

  constructor(private http: HttpClient,
              private auth: AuthService) { }

  getImages(username: string, category: string): Observable<any> {
    const httpOptions = {
      params: new HttpParams().set('username', username),
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
    return this.http.get(this.getAllImagesUrl, httpOptions).pipe(
      map((resp: Response) =>  
        this.gatherGalleryImages(resp, category)
      )
    )
  }

  private includesCategory(catList: string[], category: string): boolean {
    for(var i = 0; i < catList.length; i++) {
      if(catList[i].toLowerCase() === category.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  gatherGalleryImages(resp, category: string): GalleryImage[] {
    let galleryImages: GalleryImage[] = [];
    console.log(resp);
    let dic = JSON.parse(resp.body);
    console.log(dic);
    if(category) {
      for (var key in dic) {
        if(this.includesCategory(dic[key], category)) {
          var imageName = key.split('*')[1];
          galleryImages.push(new GalleryImage(this.s3URL.concat(imageName), imageName, dic[key]));
        }
      }
    }
    else {
      for (var key in dic) {
        var imageName = key.split('*')[1];
        galleryImages.push(new GalleryImage(this.s3URL.concat(imageName), imageName, dic[key]));
        console.log(this.s3URL.concat(key));
        console.log(dic[key]);
      }
    }
    return galleryImages;
  }

  deleteImage(imageData: ImageData) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return this.http
      .post<ImageData>(this.deleteImagesUrl, imageData)
      .pipe(catchError(this.handleError));
  }

  private handleError(res: HttpErrorResponse | any) {
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server error');
  }
            
}
