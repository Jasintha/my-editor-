import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubruleComponent } from './create-subrule.component';

describe('CreateSubruleComponent', () => {
  let component: CreateSubruleComponent;
  let fixture: ComponentFixture<CreateSubruleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSubruleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSubruleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
