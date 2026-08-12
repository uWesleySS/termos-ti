import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-emitir-termo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './emitir-termo.component.html',
  styleUrl: './emitir-termo.component.scss'
})
export class EmitirTermoComponent {
  termoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.termoForm = this.fb.group({
      tipoTermo: ['devolucao', Validators.required],
      nome: ['', Validators.required],
      cargo: ['', Validators.required],
      unidade: [''],
      registroCrea: [''],
      patrimonio: ['', Validators.required],
      equipamento: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.termoForm.invalid) {
      this.termoForm.markAllAsTouched();
      return;
    }
    console.log(this.termoForm.value);
    
  }
}