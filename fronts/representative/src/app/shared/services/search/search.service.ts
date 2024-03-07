import { Injectable } from '@angular/core';
import * as feather from 'feather-icons';
import { Menu, NavService } from '../nav/nav.service';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  public text: string = '';
  public itemsData: Menu[] = [];
  public menuItems: Menu[] = [];
  public searchResult: boolean = false;
  public searchResultEmpty: boolean = false;
  constructor(public navServices: NavService) {
    this.navServices.items.subscribe(menuItems => this.itemsData = menuItems);
  }

  searchTerm(term: string) {
    term ? this.addFix() : this.removeFix();
    if (!term) return this.menuItems = [];
    let itemsData: Menu[] = [];
    term = term.toLowerCase();
    this.itemsData.forEach((data) => {
      data.children?.forEach((menuitem: Menu) => {
        if (!menuitem?.title) return false;
        if (menuitem.title.toLowerCase().includes(term) && menuitem.type === 'link') {
          itemsData.push(menuitem);
        }
        if (!menuitem.children) return false
        menuitem.children.filter((subItems: Menu) => {
          if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
            subItems.icon = menuitem.icon;
            itemsData.push(subItems);
          }
          if (!subItems.children) return false
          subItems.children.filter((suSubItems: Menu) => {
            if (suSubItems.title?.toLowerCase().includes(term)) {
              suSubItems.icon = menuitem.icon;
              itemsData.push(suSubItems);
            }
          })
          return
        })
        this.checkSearchResultEmpty(itemsData)
        this.menuItems = itemsData;
        return
      });
    });
    return
  }

  addFix() {
    this.searchResult = true;
    document.body.classList.add('offcanvas')
  }

  removeFix() {
    this.searchResult = false;
    this.text = "";
    document.body.classList.remove('offcanvas')
  }

  checkSearchResultEmpty(items: Menu[]) {
    if (!items.length)
      this.searchResultEmpty = true;
    else
      this.searchResultEmpty = false;
  }

  clickOutside(): void {
    this.searchResult = false;
    this.searchResultEmpty = false;
  }

  ngAfterViewInit() {
    feather.replace();
  }

}
