import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TermoPdfService } from '../../core/services/termo-pdf.service';
import { TermoApiService } from '../../core/services/termo-api.service';

@Component({
  selector: 'app-emitir-termo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './emitir-termo.component.html',
  styleUrl: './emitir-termo.component.scss'
})
export class EmitirTermoComponent {
  termoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private termoPdfService: TermoPdfService,
    private termoApiService: TermoApiService
  ) {
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

    this.termoApiService.criar(termo).subscribe({
      next: () => console.log('Termo salvo no banco com sucesso'),
      error: (err) => console.error('Erro ao salvar termo:', err),
    });
  }
}