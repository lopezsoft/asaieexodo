import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  public config = {
    settings: {
      layout_type: 'ltr',
      layout_version: 'light-only',
      sidebar_type: 'compact-wrapper',
      icon: "stroke-svg",
    },
    color: {
      primary_color: "#3e5fce",
      secondary_color: "#ffce00",
    },
  };


  constructor() {
    if (this.config.settings.layout_type == "rtl") document.getElementsByTagName("html")[0].setAttribute("dir", this.config.settings.layout_type);
  }



}
