import {Component, OnInit, ViewChild, ComponentRef, NgModule, AfterViewInit} from '@angular/core';
import {Injectable, Inject} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './../auth/auth.service';
import {
  DropzoneComponent, DropzoneDirective,
  DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import * as config from '../../assets/config.json';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatChipInputEvent } from '@angular/material';

export interface TaggingDialogData {
  categories: string[];
  localImageURL: string;
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: 'error-dialog.html',
})
export class ErrorDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>) {}

  onOkayClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-tagging-dialog',
  templateUrl: 'tagging-dialog.html',
})
export class TaggingDialogComponent implements OnInit {
  inDialogURL: string;
  categories: string[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(
    public dialogRef: MatDialogRef<TaggingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaggingDialogData) {
      this.inDialogURL = data.localImageURL;
    }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.categories.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }
  remove(category: string): void {
    const index = this.categories.indexOf(category);

    if (index >= 0) {
      this.categories.splice(index, 1);
    }
  }
  ngOnInit() {
    document.getElementById('fileimage').setAttribute('src', this.inDialogURL);
  }

  onDoneClick(): void {
    this.dialogRef.close(this.categories);
  }

  onSkipClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@Injectable()
export class HomeComponent implements OnInit, AfterViewInit {

  name = 'undefined';
  loggedIn = false;
  addFile = false;
  submitButton;
  categories: string[];
  imageUrl: string;

  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    autoProcessQueue: false,
    thumbnailHeight: 250,
    thumbnailWidth: 250
  };

  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;

  constructor(private http: HttpClient,
              private auth: AuthService,
              public dialog: MatDialog) {
  }

  openTaggingDialog(): void {
    const dialogRef = this.dialog.open(TaggingDialogComponent, {
      width: '450px',
      data: {categories: this.categories, localImageURL: this.imageUrl}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.categories = result;
      console.log(this.categories);
    });
  }

  openErrorDialog(): void {
    this.resetDropzoneImages();
    this.dialog.open(ErrorDialogComponent, {
      width: '450px',
      autoFocus: true
    });
  }

  ngAfterViewInit() {
    if (this.componentRef && this.componentRef.directiveRef) {
      const dropzone = this.componentRef.directiveRef.dropzone();
      this.submitButton = document.querySelector('#submit-button');
      this.submitButton.addEventListener('click', function () {
        console.log(dropzone.files[0].name);
        dropzone.options.url = 'https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/' + dropzone.files[0].name;
        dropzone.processQueue();
      });
    }
  }

  ngOnInit() {
    /*this.http.get(config.api).subscribe((res) => {
      console.log(res);
      this.name = String(res);

    });*/
    this.getData();
  }

  onUploadError(args: any) {
    console.log('IMAGE UPLOAD ERROR:', args);
    this.openErrorDialog();
  }

  onUploadSuccess(args: any) {
    const dropzone = this.componentRef.directiveRef.dropzone();
    console.log('IMAGE UPLOAD SUCCESS:', args);
    this.imageUrl = dropzone.files[0].dataURL;
    this.resetDropzoneImages();
    this.openTaggingDialog();
  }

  resetDropzoneImages(): void {
    if (this.componentRef && this.componentRef.directiveRef) {
      this.componentRef.directiveRef.reset();
      this.addFile = false;
    }
  }

  getData(): void {
    this.auth.getData().subscribe(
      result => {
        console.log(result);
        this.name = result.username;
        this.loggedIn = true;
      },
      error => {
        console.log(error);
      }
    );
  }
}
