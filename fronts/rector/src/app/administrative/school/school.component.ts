import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';


import { TranslateService } from '@ngx-translate/core';
import { HttpServerService, MessagesService } from 'app/utils';
import { LocationService } from 'app/services/location/location.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { FormComponent } from 'app/core/components/forms/form.component';
import { Cities, Countries } from 'app/interfaces/location/location';
import { ErrorResponse } from 'app/interfaces';
import { SchoolInterface } from 'app/interfaces/administrative';

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.scss']
})
export class SchoolComponent extends FormComponent implements OnInit, AfterViewInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  Cities: Cities[] = [];
  Countries: Countries[] = [];

  constructor(
    public fb: FormBuilder,
    public msg: MessagesService,
    public http: HttpServerService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
    private location: LocationService
    ) {
    super(fb, msg, http, router, translate, aRouter, spinner);
    this.customForm = this.fb.group({
      country_id      : [45, [Validators.required]],
      city_id         : [149, [Validators.required]],
      school_id       : ['', [Validators.required, Validators.minLength(5)]],
      school_name     : ['', Validators.required],
      dni             : ['', [Validators.required, Validators.minLength(5)]],
      director_name   : ['', [Validators.required, Validators.minLength(5)]],
      suburb          : ['', [Validators.required, Validators.minLength(5)]],
      address         : ['', [Validators.required, Validators.minLength(5)]],
      location        : [''],
      phones          : [''],
      web             : [''],
      email           : ['', [Validators.pattern('^[a-z0-9._%+-ñ]+@[a-z0-9._%+-ñ]+\.[a-z]{2,4}$')]],
      number_locations: [1, [Validators.required]],
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.PutURL     = '/admin/school/update/';
    this.Cities     = this.location.getCities();
    this.Countries  = this.location.getCountries();
    this.PostURL    = '/admin/school/create';
  }
  
  ngAfterViewInit(){
    super.ngAfterViewInit();
    this.loadData();
    setTimeout(() => {
      this.Cities     = this.location.getCities();
      this.Countries  = this.location.getCountries();    
    }, 3000);
  }

  loadData(id: any = 0): void {
    super.loadData(id);
    this.http.get('/admin/school/read')
      .subscribe({
        next: (resp) => {
          const ts = this;
          localStorage.setItem('oldRoute', '/administrative');
          const frm   = ts.customForm;
          const data  = resp.records as SchoolInterface[];
          try {
            if(data.length > 0) {
              ts.uid      = data[0].id;
              ts.editing  = true;
              frm.setValue({
                country_id      : data[0].country_id,
                city_id         : data[0].city_id,
                school_id       : data[0].school_id,
                school_name     : data[0].school_name,
                dni             : data[0].dni,
                director_name   : data[0].director_name,
                suburb          : data[0].suburb,
                address         : data[0].address,
                location        : data[0].location,
                phones          : data[0].phones,
                web             : data[0].web,
                email           : data[0].email ,
                number_locations: data[0].number_locations
              });
            }
            ts.hideSpinner();
          } catch (error) {
            console.log(error);
            ts.hideSpinner();
          }
        },
        error: (err: ErrorResponse) => {
          console.log(err);
          this.hideSpinner();
        }
      });
  }

}
