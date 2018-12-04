import {Component, OnInit, ViewChild, ComponentRef, NgModule, AfterViewInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './../auth/auth.service';
import {
  DropzoneComponent, DropzoneDirective,
  DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import * as config from '../../assets/config.json';

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
    autoProcessQueue: false
  };

  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;

  constructor(private http: HttpClient,
              private auth: AuthService) {
  }

  ngAfterViewInit() {
    if (this.componentRef && this.componentRef.directiveRef) {
      const dropzone = this.componentRef.directiveRef.dropzone();
      this.submitButton = document.querySelector('#submit-button');
      this.submitButton.addEventListener('click', function () {
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
