import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { LayoutService } from "../../services/layout/layout.service";
import { Menu, NavService, menuSub } from "../../services/nav/nav.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  public margin: number = 0;
  public isShow: boolean = false;
  public leftArrowNone: boolean = true;
  public rightArrowNone: boolean = false;
  public width: number = window.innerWidth;
  public menuItems = this.navService.MENUITEMS;

  constructor(
    public navService: NavService,
    public layoutService: LayoutService,
    private router: Router
  ) {
    this.navService.items.subscribe((menuItems) => {
      this.menuItems = menuItems;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          menuItems.filter((items) => {
            if (items.children?.length) {
              items.children?.forEach((element) => {
                if (element.path === event.url) {
                  this.setNavActive(element);
                }
                if (!element.children) {
                  return false;
                }
                element.children.filter((subItems) => {
                  if (subItems.path === event.url) {
                    this.setNavActive(subItems);
                  }
                  if (!subItems.children) {
                    return false;
                  }
                  subItems.children.filter((subSubItems) => {
                    if (subSubItems.path === event.url) {
                      this.setNavActive(subSubItems);
                    }
                  });
                  return;
                });
                return;
              });
            }
          });
        }
      });
    });
  }
  // this.menuItems.forEach((data: any) => {
  //   if (data !== item) {
  //     data.active = false;
  //     if (data.children) {
  //       data.children.forEach((child: any) => {
  //         child.active = false;
  //         if (child.children) {
  //           child.children.forEach((subChild: any) => {
  //             subChild.active = false;
  //           });
  //         }
  //       });
  //     }
  //   }
  // });
  // item.active = !item.active;

  toggletNavActive(item: Menu) {
    if (!item.active) {
      this.menuItems.forEach((a:any) => {
        if(a.children){
          a.children.forEach((data:any) => {
            // data.active = false;
            if (a.children.includes(item)) {
              data.active = false;
            }
            if (!data.children){ return false} 
            data.children.forEach((b:any) => {
              if (data.children.includes(item)) {
                b.active = false;
              }
            });
          })
        }
      });

    }
    item.active = !item.active;

    // if(!item.active){
    //   this.menuItems.forEach((data:any) => {
    //     if(data.children){
    //       data.children.forEach((child:any) => {
    //         if(child.children){
    //           child.children.forEach((subChild:any) => {
    //             if(subChild.children){
    //               subChild.children.forEach((elem:any) => {
    //                 if(subChild.children.includes(elem)){
    //                   subChild.active = false;
    //                 }
    //               })
    //             }
    //             else{
    //               child.active = false;
    //             }
    //             if(!subChild.children){
    //                 subChild.active = false
    //                 // child.active = false
    //             }
    //             // if(child.children.includes(item)){
    //             //   subChild.active = false;
    //             // }
    //             // child.active = false
    //           })
    //         }
    //       })
    //     }        
    //   })
    // }
    // // if (!item.active) {
    // //   this.menuItems.forEach((data: any) => {
    // //     data.active = false;
    // //     if (data.children) {
    // //       data.children.forEach((child: any) => {
    // //         if (child.children) {
    // //           child.children.forEach((subChild: any) => {
    // //             if(subChild.children){
    // //               subChild.children.forEach((elem:any) => {
    // //                 if(subChild.children.includes(item)){
    // //                   elem.active = false;
    // //                 }
    // //               })
    // //             }
    // //             if(!subChild.children){
    // //               subChild.active = false;
    // //             }
    // //             // if (child.children.includes(subChild)) {
    // //             //   subChild.active = false;
    // //             // }
    // //             // if (!subChild.children) {
    // //             //   child.active = false;
    // //             // }
    // //           });
    // //         }
    // //       });
          
    // //     }
    // //   });
    // // }
    // item.active = !item.active;
    
  }

  setNavActive(item: Menu) {
    this.menuItems.filter((items: Menu) => {
      if (items.children?.length) {
        items?.children.forEach((elm: Menu) => {
          if (elm !== item) {
            elm.active = false;
          }
          if (elm.children && elm.children.includes(item)) {
            elm.active = true;
          }
          if (elm.children) {
            elm.children.filter((submenuItems: Menu) => {
              if (
                submenuItems.children &&
                submenuItems.children.includes(item)
              ) {
                items.active = true;
                submenuItems.active = true;
              }
            });
          }
        });
      }
    });
  }

  scrollToLeft() {
    if (this.margin >= -this.width) {
      this.margin = 0;
      this.leftArrowNone = true;
      this.rightArrowNone = false;
    } else {
      this.margin += this.width;
      this.rightArrowNone = false;
    }
  }

  scrollToRight() {
    if (this.margin <= -3051) {
      this.margin = -3464;
      this.leftArrowNone = false;
      this.rightArrowNone = true;
    } else {
      this.margin += -this.width;
      this.leftArrowNone = false;
    }
  }

  sidebarToggle() {
    this.navService.collapseSidebar = !this.navService.collapseSidebar;
  }
}
