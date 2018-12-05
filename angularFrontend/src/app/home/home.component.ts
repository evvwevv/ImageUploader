import {Component, OnInit, ViewChild, ComponentRef, NgModule, AfterViewInit} from '@angular/core';
import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './../auth/auth.service';
import {
  DropzoneComponent, DropzoneDirective,
  DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import * as config from '../../assets/config.json';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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
        dropzone.options.url = 'https://s3.amazonaws.com/imageuploader-main-bucket/' + dropzone.files[0].name;
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
    console.log('IMAGE UPLOAD SUCCESS:', args);
    this.resetDropzoneImages();
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
