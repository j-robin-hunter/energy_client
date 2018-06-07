import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfuseComponent } from './selfuse.component';

describe('SelfuseComponent', () => {
  let component: SelfuseComponent;
  let fixture: ComponentFixture<SelfuseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfuseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfuseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
