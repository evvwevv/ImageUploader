import { Component, OnInit } from '@angular/core';
import {AuthService} from './../auth/auth.service';
import {StoreImageService} from './../store-image.service';
import { Observable } from 'rxjs';
import {GalleryService} from './../gallery-service.service';
import {GalleryImage} from './../galleryImage'; 
import { stringType } from 'aws-sdk/clients/iam';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatChipInputEvent } from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Injectable, Inject} from '@angular/core';
import {ImageData} from './../imageData'

export interface GalleryImageDialogData {
  galleryImage: GalleryImage;
}

@Component({
  selector: 'app-galleryImage-dialog',
  templateUrl: 'galleryImage-dialog.html',
})
export class GalleryImageDialogComponent implements OnInit {
  galleryImage: GalleryImage;
  tempTags: string[];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  hasNotModifiedTags = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(
    public dialogRef: MatDialogRef<GalleryImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GalleryImageDialogData) {
      this.galleryImage = data.galleryImage;
    }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    this.hasNotModifiedTags = false;

    if ((value || '').trim()) {
      this.tempTags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }
  remove(tag: string): void {
    const index = this.tempTags.indexOf(tag);
    this.hasNotModifiedTags = false;
    if (index >= 0) {
      this.tempTags.splice(index, 1);
    }
  }
  ngOnInit() {
    document.getElementById('fileimage').setAttribute('src', this.galleryImage.imageUrl);
    this.tempTags = [...this.galleryImage.tags];
  }

  onSaveClick(): void {
    this.galleryImage.tags = [...this.tempTags];
    this.dialogRef.close(this.galleryImage);
    
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  imageToShow: any;
  isImageLoading = false;
  galleryImages$: Observable<[GalleryImage]>;
  username: string;
  temp: string;

  constructor(private galleryService: GalleryService,
              private auth: AuthService,
              private storeImageService: StoreImageService,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.auth.getData().subscribe(result => {
      this.username = result.username;
      this.galleryService.getImages(result.username).subscribe((result: Observable<[GalleryImage]>) => {
        this.galleryImages$ = result;
        console.log(result[0]);
        console.log(result[0].imageUrl);
        this.temp = JSON.parse(JSON.stringify(result[0].imageUrl));
      });
    })
  }

  openGalleryImageDialog(galleryImage: GalleryImage): void {
    const dialogRef = this.dialog.open(GalleryImageDialogComponent, {
      width: '450px',
      data: {galleryImage: galleryImage}
    });

    dialogRef.afterClosed().subscribe((result: GalleryImage) => {
      if(result != null) {
        console.log(this.username);
        this.storeImageService.post(new ImageData(this.username, result.imageName, result.tags)).subscribe();
      }
      console.log(result);
    });
  }

}
