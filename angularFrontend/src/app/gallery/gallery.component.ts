import { Component, OnInit } from '@angular/core';
import {AuthService} from './../auth/auth.service';
import { Observable } from 'rxjs';
import {GalleryService} from './../gallery-service.service';
import {GalleryImage} from './../galleryImage'; 
import { stringType } from 'aws-sdk/clients/iam';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  imageToShow: any;
  isImageLoading = false;
  galleryImages: GalleryImage[] = [];

  constructor(private galleryService: GalleryService,
              private auth: AuthService) { }

  getImageFromService(username: string): Observable<GalleryImage[]> {
    this.isImageLoading = true;
    console.log(username);
    return []; //this.galleryService.getImages().subscribe();
  }

  ngOnInit() {
    this.auth.getData().subscribe(result => {
      this.galleryImages = this.getImageFromService(result.username);
    })
    //this.galleryImages = this.getImageFromService();
    setTimeout(function() {
      console.log(this.galleryImages);
      }, 5000)   
    console.log(this.galleryImages);
  }

}
