import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLamdafunctionComponent } from './create-lamdafunction.component';

describe('CreateLamdafunctionComponent', () => {
  let component: CreateLamdafunctionComponent;
  let fixture: ComponentFixture<CreateLamdafunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLamdafunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLamdafunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
