import { Component, OnInit } from '@angular/core';
import {AuthService} from './../auth/auth.service';
import {GalleryService} from './../gallery-service.service'

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  imageToShow: any;
  isImageLoading = false;

  constructor(private galleryService: GalleryService) { }

  getImageFromService() {
    this.isImageLoading = true;
    this.galleryService.getImages();
  }

  ngOnInit() {
    this.getImageFromService();
  }

}
