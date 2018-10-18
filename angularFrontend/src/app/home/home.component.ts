import {Component, OnInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as config from '../../assets/config.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@Injectable()
export class HomeComponent implements OnInit {

  name = 'undefined';

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.http.get(config.api).subscribe((res) => {
      console.log(res);
      this.name = String(res);

    });
  }


}
