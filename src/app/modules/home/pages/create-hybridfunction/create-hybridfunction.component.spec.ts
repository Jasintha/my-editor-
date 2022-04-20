import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHybridfunctionComponent } from './create-hybridfunction.component';

describe('CreateHybridfunctionComponent', () => {
  let component: CreateHybridfunctionComponent;
  let fixture: ComponentFixture<CreateHybridfunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHybridfunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHybridfunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
