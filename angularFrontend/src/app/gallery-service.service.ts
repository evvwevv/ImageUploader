import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Response } from '@angular/http';
import {AuthService} from './auth/auth.service';
import {GalleryImage} from './galleryImage';
import {map} from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private getAllImagesUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/getuserimages';
  private s3URL = 'https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/';

  constructor(private http: HttpClient,
              private auth: AuthService) { }

  getImages(username: string): Observable<any> {
    const httpOptions = {
      params: new HttpParams().set('username', username),
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
    return this.http.get(this.getAllImagesUrl, httpOptions).pipe(
      map((resp: Response) =>  
        this.gatherGalleryImages(resp)
      )
    )
    /*return this.auth.getData().pipe(
      map(result => {
        console.log("getting images...");
        return this.makeImagesRequest(result.username);
      })
    )*/
  }

  gatherGalleryImages(resp): GalleryImage[] {
    let galleryImages: GalleryImage[] = [];
    console.log(resp);
    let dic = JSON.parse(resp.body);
    console.log(dic);
    for (var key in dic) {
      galleryImages.push(new GalleryImage(this.s3URL.concat(key), key, dic[key]));
      console.log(this.s3URL.concat(key));
      console.log(dic[key]);
    }
    return galleryImages;
  }
            
  /*makeImagesRequest(username: string): GalleryImage[] {
    const httpOptions = {
      params: new HttpParams().set('username', username),
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
    this.http.get(this.getAllImagesUrl, httpOptions)
      .subscribe((resp:Response) => {
        return this.gatherGalleryImages(resp.body),
        (error) => {
          console.log("error at makeImagesRequest");
          return [];
        }
      }     
    );
    console.log("returning nothing...");
    return [];
  }*/
}
