import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEpicComponent } from './edit-epic.component';

describe('EditStoryComponent', () => {
  let component: EditEpicComponent;
  let fixture: ComponentFixture<EditEpicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEpicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEpicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
