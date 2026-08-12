import { Routes } from '@angular/router';
import { EmitirTermoComponent } from './pages/emitir-termo/emitir-termo.component';
import { HistoricoComponent } from './pages/historico/historico.component';

export const routes: Routes = [
  { path: '', component: EmitirTermoComponent },
  { path: 'historico', component: HistoricoComponent },
];