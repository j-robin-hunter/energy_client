import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatusesComponent } from './whatuses.component';

describe('WhatusesComponent', () => {
  let component: WhatusesComponent;
  let fixture: ComponentFixture<WhatusesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatusesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
