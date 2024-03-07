import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LayoutService } from "../../../services/layout/layout.service";
import { NavService } from "../../../services/nav/nav.service";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"],
})
export class ContentComponent {
  constructor(
    public navServices: NavService,
    public layoutService: LayoutService,
    public route: ActivatedRoute
  ) {}
}
