import { Component } from '@angular/core';
import { SearchService } from '../../../../shared/services/search/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent {
  public open: boolean = false;
  public isSearch: boolean = false;

  constructor(public searchService: SearchService) { }

  search() {
    this.isSearch = !this.isSearch;
  }
}
