import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Termo } from '../../core/models/termo';
import { TermoApiService } from '../../core/services/termo-api.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss'
})
export class HistoricoComponent implements OnInit {
  termos: Termo[] = [];

  constructor(private termoApiService: TermoApiService) {}

  ngOnInit(): void {
    this.termoApiService.listar().subscribe({
      next: (termos) => this.termos = termos,
      error: (err) => console.error('Erro ao carregar historico:', err),
    });
  }
}