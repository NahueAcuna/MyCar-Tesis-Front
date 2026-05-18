import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPosts } from './my-posts';

describe('MyPosts', () => {
  let component: MyPosts;
  let fixture: ComponentFixture<MyPosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPosts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
