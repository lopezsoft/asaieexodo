import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  BehaviorSubject,
  Subject,
  debounceTime,
  fromEvent,
  takeUntil,
} from "rxjs";

export interface Menu {
  items: Menu[];
  headTitle1: string;
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  badgeType?: string;
  badgeValue?: string;
  active?: boolean;
  bookmark?: boolean;
  children?: Menu[];
  breadCrumb: boolean;
}

export interface subMenu {
  title?: string;
  icon?: string;
  type?: string;
  badgeType?: string;
  badgeValue?: string;
  active?: boolean;
  path?: string;
  children: children[];
}

export interface children {
  path?: string;
  title?: string;
  type?: string;
  active?: boolean;
}

export interface menuSub {
  children: any;
  active: boolean;
  path: string;
  title: string;
  type: string;
}

@Injectable({
  providedIn: "root",
})
export class NavService {
  public screenWidth: BehaviorSubject<number> = new BehaviorSubject(
    window.innerWidth
  );
  private unsubscriber: Subject<any> = new Subject();

  // Full screen
  public fullScreen: boolean = false;

  // Mega Menu
  public megaMenu: boolean = false;
  public levelMenu: boolean = false;

  // Language
  public language: boolean = false;
  // Collapse Sidebar
  public collapseSidebar: boolean = window.innerWidth < 1200;

  constructor(private router: Router) {
    this.setScreenWidth(window.innerWidth);
    fromEvent(window, "resize")
      .pipe(debounceTime(0), takeUntil(this.unsubscriber))
      .subscribe((evt: any) => {
        this.setScreenWidth(evt.target.innerWidth);
        if (evt.target.innerWidth < 1200) {
          this.collapseSidebar = true;
        }else {
          this.collapseSidebar = false;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscriber.complete();
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }

  MENUITEMS: Menu[] | any = [
    {
      children: [
        {
          path: "/sample-page",
          title: "Elecciones",
          icon: "file-text",
          type: "link",
          active: true,
        },
      ],
    },
  ];
  items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
