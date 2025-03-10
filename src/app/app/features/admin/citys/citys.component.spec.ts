import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitysComponent } from './citys.component';

describe('CitysComponent', () => {
  let component: CitysComponent;
  let fixture: ComponentFixture<CitysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
