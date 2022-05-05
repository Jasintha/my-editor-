import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicefileComponent } from './servicefile.component';

describe('ServicefileComponent', () => {
  let component: ServicefileComponent;
  let fixture: ComponentFixture<ServicefileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicefileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicefileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
