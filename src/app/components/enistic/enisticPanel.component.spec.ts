import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnisticPanelComponent } from './enisticPanel.component';

describe('EnisticPanelComponent', () => {
  let component: EnisticPanelComponent;
  let fixture: ComponentFixture<EnisticPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnisticPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnisticPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
