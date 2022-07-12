import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDirectorsComponent } from './group-directors.component';

describe('GroupDirectorsComponent', () => {
  let component: GroupDirectorsComponent;
  let fixture: ComponentFixture<GroupDirectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupDirectorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDirectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
