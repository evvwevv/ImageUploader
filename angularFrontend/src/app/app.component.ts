import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angularFrontend';

  constructor(private router: Router) {
  }

  public onUploadClick() {
    this.router.navigate(['./']);
  }

  public onSignInClick() {
    this.router.navigate(['./login']);
  }

  public onNewUserClick() {
    this.router.navigate(['./signup']);
  }


}
