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

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.imageToShow = reader.result;
    }, false);
 
    if (image) {
       reader.readAsDataURL(image);
    }
  }

  getImageFromService() {
    this.isImageLoading = true;
    this.galleryService.getImage('https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/Pikachu.jpg').subscribe(data => {
      this.createImageFromBlob(data);
      this.isImageLoading = false;
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    });
  }

  ngOnInit() {
    this.getImageFromService();
  }

}
