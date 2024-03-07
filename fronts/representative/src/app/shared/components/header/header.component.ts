import { Component } from '@angular/core';
import { LayoutService } from '../../services/layout/layout.service';
import { NavService } from '../../services/nav/nav.service';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public isSearch: boolean = false;
  public open: boolean = false;
  constructor(public navServices: NavService,
    public layoutService: LayoutService,
    public searchService: SearchService,
  ) { }

  ngOnInit() {
    
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
    this.navServices.megaMenu = false;
    this.navServices.levelMenu = false;
  }

  search() {
    this.isSearch = !this.isSearch;
  }

  languageToggle() {
    this.navServices.language = !this.navServices.language;
  }
}
