import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TermoPdfService } from '../../core/services/termo-pdf.service';

@Component({
  selector: 'app-emitir-termo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './emitir-termo.component.html',
  styleUrl: './emitir-termo.component.scss'
})
export class EmitirTermoComponent {
  termoForm: FormGroup;

  constructor(private fb: FormBuilder, private termoPdfService: TermoPdfService) {
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
    const termo = {
      ...this.termoForm.value,
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
    };

    this.termoPdfService.gerarPdf(termo);
  }
    
}