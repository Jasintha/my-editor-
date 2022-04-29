import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuiltInPageComponent } from './built-in-page.component';

describe('BuiltInPageComponent', () => {
  let component: BuiltInPageComponent;
  let fixture: ComponentFixture<BuiltInPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuiltInPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuiltInPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
