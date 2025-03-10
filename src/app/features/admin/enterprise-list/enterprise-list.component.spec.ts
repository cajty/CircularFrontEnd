import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseListComponent } from './enterprise-list.component';

describe('EnterpriseListComponent', () => {
  let component: EnterpriseListComponent;
  let fixture: ComponentFixture<EnterpriseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterpriseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterpriseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
