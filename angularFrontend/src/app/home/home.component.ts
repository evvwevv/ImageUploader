import {Component, OnInit} from '@angular/core';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './../auth/auth.service';
import * as config from '../../assets/config.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@Injectable()
export class HomeComponent implements OnInit {

  name = 'undefined';
  loggedIn = false;

  constructor(private http: HttpClient,
              private auth: AuthService) {
  }

  ngOnInit() {
    /*this.http.get(config.api).subscribe((res) => {
      console.log(res);
      this.name = String(res);

    });*/
    this.getData();
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
