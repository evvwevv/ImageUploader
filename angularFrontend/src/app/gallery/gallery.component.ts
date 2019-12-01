import { Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from './../auth/auth.service';
import {StoreImageService} from './../store-image.service';
import { Observable } from 'rxjs';
import {GalleryService} from './../gallery-service.service';
import {GalleryImage} from './../galleryImage'; 
import { stringType } from 'aws-sdk/clients/iam';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { MatChipInputEvent } from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Injectable, Inject} from '@angular/core';
import {ImageData} from './../imageData'
import {SharingImageData} from './../sharingImageData'
import { integer } from 'aws-sdk/clients/cloudfront';
import {ErrorDialogComponent} from '../home/home.component';
import {FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { SharedImage } from '../sharedImage';

export interface GalleryImageDialogData {
  galleryImage: GalleryImage;
  username: string;
}

export interface DeleteDialogData {
  galleryImage: GalleryImage;
  username: string;
}

export interface ShareDialogData {
  galleryImage: GalleryImage;
  username: string;
}

export interface SharedImageDialogData {
  sharedImage: SharedImage;
}

@Component({
  selector: 'app-delete-dialog',
  templateUrl: 'delete-dialog.html',
})
export class DeleteDialogComponent {
  galleryImage: GalleryImage;
  username: string;
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData) {
      this.galleryImage = data.galleryImage;
      this.username = data.username;
    }

  confirmDelete(): void {
    this.dialogRef.close(this.galleryImage);
  }

  cancelDelete(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-sharedImage-dialog',
  templateUrl: 'sharedImage-dialog.html',
})

export class SharedImageDialogComponent implements OnInit {
  sharedImage: SharedImage;
  constructor(
    public dialogRef: MatDialogRef<SharedImageDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: SharedImageDialogData) {
      this.sharedImage = data.sharedImage;
    }

    ngOnInit() {
      document.getElementById('fileimage').setAttribute('src', this.sharedImage.imageUrl);
    }

    onCloseClick() {
      this.dialogRef.close();
    }

}

@Component({
  selector: 'app-share-dialog',
  templateUrl: 'share-dialog.html',
})
export class ShareDialogComponent implements OnInit {
  galleryImage: GalleryImage;
  public shareForm: FormGroup;
  username: string;
  userToShareWith: string;
  selectable = true;
  removable = true;
  addOnBlur = true;
  sharedUsers: string[];

  @ViewChild('chipList') chipList;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    private storeImageService: StoreImageService,
    private _snackbar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ShareDialogData) {
      this.galleryImage = data.galleryImage;
      this.username = data.username;
      this.sharedUsers = this.galleryImage.sharedUsers;
    }

  ngOnInit() {
    this.shareForm = this.fb.group({
      user: new FormControl('', Validators.email)
    });
  }

  openErrorDialog(errorMsg: string, errorTitle: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '450px',
      autoFocus: true,
      data: {errorMsg: errorMsg, errorTitle: errorTitle}
    });
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if(this.shareForm.controls.user.valid) {
        if(value.trim() === this.username) {
          this.openErrorDialog("You can't share an image with yourself", "Sharing Error");
        }
        else if(this.sharedUsers.indexOf(value.trim()) >= 0) {
          this.openErrorDialog("This image is already shared with " + value.trim(), "Sharing Error");
        }
        else {
          this.sharedUsers.push(value.trim());
          this.shareForm.controls.user.markAsDirty();
          this.changeUserPermissions(value.trim(), "add");
          this.chipList.errorState = false;
        }
      }
      else {
        this.chipList.errorState = true;
        const index = this.sharedUsers.indexOf(value.trim());
        if(index >= 0) {
          this.sharedUsers.splice(index, 1);
        }
      }
    }
    else {
      this.shareForm.controls.user.updateValueAndValidity();
    }
    input.value = '';
  }
  remove(user: string): void {
    const index = this.sharedUsers.indexOf(user);
    if (index >= 0) {
      this.changeUserPermissions(this.sharedUsers[index], "delete");
      this.sharedUsers.splice(index, 1);
    }
  }
  
  onDoneClick(): void {
    this.dialogRef.close(this.galleryImage);
  }

  openSnackBar(action: string) {
    if(action === "add") {
      this._snackbar.open("Image Successfully Shared", "Dismiss", {
        duration: 2000,
      });
    }
    else if("delete") {
      this._snackbar.open("Permissions Successfully Revoked", "Dismiss", {
        duration: 2000,
      });
    }

  }

  changeUserPermissions(value: string, action: string) {
    if(value) {
      const userToShareWith = value;
      this.storeImageService.shareWithUser(new SharingImageData(this.username, 
        this.galleryImage.imageName, action, userToShareWith)).subscribe((result => {
          this.openSnackBar(action);
        }))
    }
  }

}

@Component({
  selector: 'app-galleryImage-dialog',
  templateUrl: 'galleryImage-dialog.html',
})
export class GalleryImageDialogComponent implements OnInit {
  galleryImage: GalleryImage;
  username: string;
  tempTags: string[];
  selectable = true;
  removable = true;
  addOnBlur = true;
  hasNotModifiedTags = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(
    public dialogRef: MatDialogRef<GalleryImageDialogComponent>,
    private galleryService: GalleryService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: GalleryImageDialogData) {
      this.galleryImage = data.galleryImage;
      this.username = data.username;
    }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.hasNotModifiedTags = false;
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

  onShareClick() {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: '450px',
      data: {galleryImage: this.galleryImage, username: this.username}
    });

    dialogRef.afterClosed().subscribe((result: GalleryImage) => {
      console.log("closed");
    })

  }

  onSaveClick(): void {
    this.galleryImage.tags = [...this.tempTags];
    this.dialogRef.close(this.galleryImage);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onDeleteClick(): void {
    this.dialogRef.close(null);
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
  galleryImages: GalleryImage[];
  sharedImages$: Observable<[SharedImage]>;
  tempImages: GalleryImage[];
  username: string;
  temp: string;
  breakpoint: integer;

  constructor(private galleryService: GalleryService,
              private auth: AuthService,
              private storeImageService: StoreImageService,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.updateImageGallery('');
    this.updateSharedImageGallery();
    this.setColNum();
  }

  setColNum() {
    if(window.innerWidth <= 800) {
      this.breakpoint = 1;
    }
    else if(window.innerWidth > 800 && window.innerWidth < 1200) {
      this.breakpoint = 2;
    }
    else {
      this.breakpoint = 4;
    }
  }

  tabClick(tab) {
    if(tab.index === 1) {
      this.updateSharedImageGallery();
    }
  }

  updateSharedImageGallery(): boolean {
    this.auth.getData().subscribe(result => {
      this.username = result.username;
      this.galleryService.getSharedImages(result.username).subscribe((result: Observable<[SharedImage]>) => {
        this.sharedImages$ = result;
        return true;
      })
    })
    return false;
  }

  updateImageGallery(category: string): boolean {
    this.auth.getData().subscribe(result => {
      this.username = result.username;
      this.galleryService.getImages(result.username, category).subscribe((result: Observable<any>) => {
        this.galleryImages = this.galleryService.combineSharedUserData(result);
        if(category) {
          if(!result[0][0]) {
            this.openErrorDialog("There were no images found associated with that category", "No Results");
            this.updateImageGallery('');
            return false;
          }
        }

        return true;
      });
    })
    return false;
  }

  openErrorDialog(errorMsg: string, errorTitle: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '450px',
      autoFocus: true,
      data: {errorMsg: errorMsg, errorTitle: errorTitle}
    });
  }


  searchForCategory(event: any) {
    var inputCategory = event.target.value;
    if(inputCategory.trim()) {
      if(!this.updateImageGallery(inputCategory)) {
        event.target.value = "";
      }
    }
    else {
      this.updateImageGallery('');
    }
  }

  openDeleteDialog(galleryImage: GalleryImage, username: string) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '450px',
      data: {galleryImage: galleryImage, username: this.username}
    });

    dialogRef.afterClosed().subscribe((result: GalleryImage) => {
      if(result != null) {
        this.galleryService.deleteImage(new ImageData(this.username, result.imageName, [])).subscribe((result => {
          this.updateImageGallery('');
        }));
      }
    })
  }

  openGalleryImageDialog(galleryImage: GalleryImage): void {
    const dialogRef = this.dialog.open(GalleryImageDialogComponent, {
      width: '450px',
      data: {galleryImage: galleryImage, username: this.username}
    });

    dialogRef.afterClosed().subscribe((result: GalleryImage) => {
      if(result === null) {
        this.openDeleteDialog(galleryImage, this.username);
      }
      else if(result != null) {
        this.storeImageService.post(new ImageData(this.username, result.imageName, result.tags)).subscribe();
      }
    });
  }

  openSharedImageDialog(sharedImage: SharedImage): void {
    const dialogRef = this.dialog.open(SharedImageDialogComponent, {
      width: '450px',
      data: {sharedImage: sharedImage}
    });
  }

}
