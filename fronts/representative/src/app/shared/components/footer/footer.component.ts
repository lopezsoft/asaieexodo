import { Component } from '@angular/core';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public footerFix = false;
  public footerLight = false;
  public footerDark = false;
  
  ngDoCheck() {
    if (window.location.pathname == '/page-layout/footer-dark') {
      this.footerDark = true;
      this.footerLight = false;
      this.footerFix = false;
    } else if (window.location.pathname == '/page-layout/footer-light') {
      this.footerLight = true;
      this.footerDark = false;
      this.footerFix = false;
    } else if (window.location.pathname == '/page-layout/footer-fixed') {
      this.footerFix = true;
      this.footerLight = false;
      this.footerDark = false;
    }
  }
  
  getVersion() {
    return environment.VERSION
  }
}
