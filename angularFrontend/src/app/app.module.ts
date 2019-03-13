import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent, ErrorDialogComponent, TaggingDialogComponent } from './home/home.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { puts } from 'util';
import { GalleryComponent, GalleryImageDialogComponent } from './gallery/gallery.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  method: 'put',
  url: 'https://s3.amazonaws.com/imageuploader-main-bucket/All_User_Images/',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
 };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    ErrorDialogComponent,
    TaggingDialogComponent,
    GalleryImageDialogComponent,
    GalleryComponent
  ],
  entryComponents: [
    ErrorDialogComponent,
    TaggingDialogComponent,
    GalleryImageDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    DropzoneModule
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
