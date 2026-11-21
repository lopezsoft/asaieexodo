import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicNotesComponent } from './academic-notes.component';

describe('AcademicNotesComponent', () => {
  let component: AcademicNotesComponent;
  let fixture: ComponentFixture<AcademicNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
