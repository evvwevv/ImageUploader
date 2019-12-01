import { Injectable } from '@angular/core';
import { of, Observable, forkJoin, throwError as observableThrowError} from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Response } from '@angular/http';
import {AuthService} from './auth/auth.service';
import {GalleryImage} from './galleryImage';
import {catchError, map} from 'rxjs/operators';
import { ImageData } from './imageData';
import {SharedImage} from './sharedImage';
import {SharedUserData} from './sharedUserData';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private getUploadedImagesUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/getuserimages';
  private deleteImagesUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/actuallydeleteimage';
  private s3URL = 'https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/';
  private getSharedImagesUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/getallimagesuserhasaccessto';
  private getSharedUsersUrl = 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/getuserswithpermissiontoviewimages';

  constructor(private http: HttpClient,
              private auth: AuthService) { }

  getImages(username: string, category: string): Observable<any> {
    const httpOptions = {
      params: new HttpParams().set('username', username),
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
    let o1: Observable<any> = this.http.get(this.getUploadedImagesUrl, httpOptions).pipe(
      map((resp: Response) =>
        this.gatherGalleryImages(resp, category)
      )
    )

    let o2: Observable<any> = this.http.get(this.getSharedUsersUrl, httpOptions).pipe(
      map((resp: Response) => 
        this.gatherSharedUsers(resp, username)
      )
    )

    return forkJoin(o1, o2)
  }

  combineSharedUserData(resp) {
    let combinedGalleryImages: GalleryImage[] = [];
    for(var i = 0; i < resp[0].length; i++) {
      for(var j = 0; j < resp[1].length; j++) {
        if(resp[0][i].imageName === resp[1][j].imageName) {
          combinedGalleryImages.push(new GalleryImage(resp[0][i].imageUrl, resp[0][i].imageName, resp[0][i].tags, resp[1][j].users))
        }
      }
    }
    return combinedGalleryImages;
  }

  gatherSharedUsers(resp, username: string): SharedUserData[] {
    let sharedUsers: SharedUserData[] = [];
    let dic = JSON.parse(resp.body);
    for(var key in dic) {
      var imageName = key.split('*')[1];
      let ownerRemovedUserList = this.removeOwner(dic[key], username);
      sharedUsers.push(new SharedUserData(imageName, ownerRemovedUserList));
    }
    return sharedUsers;
  }

  private removeOwner(userList: string[], username: string): string[] {
    const index = userList.indexOf(username);
    if(index >= 0) {
      userList.splice(index, 1);
    }
    return userList;
  }


  getSharedImages(username: string): Observable<any> {
    const httpOptions = {
      params: new HttpParams().set('username', username),
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
    return this.http.get(this.getSharedImagesUrl, httpOptions).pipe(
      map((resp: Response) =>
        this.gatherSharedImages(resp)
      )
    )
  }

  gatherSharedImages(resp): SharedImage[] {
    let sharedImages: SharedImage[] = [];
    let list = JSON.parse(resp.body);
    for (var i = 0; i < list.length; i++) {
      var originalOwner = list[i].split('*')[0];
      var imageName = list[i].split('*')[1];
      sharedImages.push(new SharedImage(this.s3URL.concat(imageName), imageName, originalOwner));
    }
    return sharedImages;
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
    let dic = JSON.parse(resp.body);
    if(category) {
      for (var key in dic) {
        if(this.includesCategory(dic[key], category)) {
          var imageName = key.split('*')[1];
          galleryImages.push(new GalleryImage(this.s3URL.concat(imageName), imageName, dic[key], []));
        }
      }
    }
    else {
      for (var key in dic) {
        var imageName = key.split('*')[1];
        galleryImages.push(new GalleryImage(this.s3URL.concat(imageName), imageName, dic[key], []));
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
