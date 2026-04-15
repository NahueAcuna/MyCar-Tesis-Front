import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationForm } from './publication-form';

describe('PublicationForm', () => {
  let component: PublicationForm;
  let fixture: ComponentFixture<PublicationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
