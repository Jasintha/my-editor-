import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildViewComponent } from './build-view.component';

describe('MainMenuComponent', () => {
  let component: BuildViewComponent;
  let fixture: ComponentFixture<BuildViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
