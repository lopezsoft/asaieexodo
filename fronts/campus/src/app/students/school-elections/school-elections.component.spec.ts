import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolElectionsComponent } from './school-elections.component';

describe('SchoolElectionsComponent', () => {
  let component: SchoolElectionsComponent;
  let fixture: ComponentFixture<SchoolElectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolElectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolElectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
