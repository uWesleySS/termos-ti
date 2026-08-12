import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Termo } from '../../core/models/termo';
import { TermoPdfService } from '../../core/services/termo-pdf.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss'
})
export class HistoricoComponent implements OnInit {
  termos: Termo[] = [];

  constructor(private termoPdfService: TermoPdfService) {}

  ngOnInit(): void {
    this.termos = this.termoPdfService.obterHistorico();
  }
}