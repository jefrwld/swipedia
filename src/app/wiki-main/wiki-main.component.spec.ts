import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WikiMainComponent } from './wiki-main.component';

describe('WikiMainComponent', () => {
  let component: WikiMainComponent;
  let fixture: ComponentFixture<WikiMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WikiMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WikiMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
