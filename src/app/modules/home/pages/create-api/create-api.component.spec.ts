import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateApiComponent } from './create-api.component';

describe('CreateApiComponent', () => {
  let component: CreateApiComponent;
  let fixture: ComponentFixture<CreateApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateApiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
