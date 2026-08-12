import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmitirTermoComponent } from './emitir-termo.component';

describe('EmitirTermoComponent', () => {
  let component: EmitirTermoComponent;
  let fixture: ComponentFixture<EmitirTermoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitirTermoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmitirTermoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
