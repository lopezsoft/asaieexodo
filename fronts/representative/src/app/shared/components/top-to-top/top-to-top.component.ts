import { ViewportScroller } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-top-to-top',
  templateUrl: './top-to-top.component.html',
  styleUrls: ['./top-to-top.component.scss']
})

export class TopToTopComponent {

  public show: boolean = false;

  constructor(private viewScroller: ViewportScroller) { }

  ngOnInit(): void {
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  	if (number > 600) { 
  	  this.show = true;
  	} else {
  	  this.show = false;
  	}
  }

  tapToTop() {
  	this.viewScroller.scrollToPosition([0, 0]);
  }
  
}
