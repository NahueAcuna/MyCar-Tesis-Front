import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReservations } from './my-reservations';

describe('MyReservations', () => {
  let component: MyReservations;
  let fixture: ComponentFixture<MyReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyReservations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyReservations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
