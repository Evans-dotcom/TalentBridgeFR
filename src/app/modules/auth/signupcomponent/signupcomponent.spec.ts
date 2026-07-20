import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signupcomponent } from './signupcomponent';

describe('Signupcomponent', () => {
  let component: Signupcomponent;
  let fixture: ComponentFixture<Signupcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signupcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signupcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
