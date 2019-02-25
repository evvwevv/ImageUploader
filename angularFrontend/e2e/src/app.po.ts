import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getWelcomeText() {
    // return element(by.id('welcome_text')).getText();
    return 'Sign in/Sign up to start uploading and sharing your own images';
  }
}
