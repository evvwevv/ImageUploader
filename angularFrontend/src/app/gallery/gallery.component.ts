import { Component, OnInit } from '@angular/core';
import {AuthService} from './../auth/auth.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  uploaded=false;

  constructor() { }

  ngOnInit() {
  }

}
