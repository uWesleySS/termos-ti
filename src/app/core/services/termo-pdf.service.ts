import { Injectable } from '@angular/core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Termo } from '../models/termo';

@Injectable({
  providedIn: 'root'
})
export class TermoPdfService {

  async gerarPdf(termo: Termo): Promise<void> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const titulo = termo.tipoTermo === 'devolucao'
      ? 'TERMO DE DEVOLUÇÃO DE EQUIPAMENTO DE INFORMÁTICA'
      : 'TERMO DE RESPONSABILIDADE DE EQUIPAMENTO DE INFORMÁTICA';

    let y = 780;

    page.drawText(titulo, {
      x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0),
    });

    y -= 50;
    const linhas = [
      `Nome: ${termo.nome}`,
      `Cargo: ${termo.cargo}`,
      `Unidade: ${termo.unidade || '-'}`,
      `Registro CREA-SP: ${termo.registroCrea || '-'}`,
      `Patrimônio/Simpress N°: ${termo.patrimonio}`,
      `Equipamento: ${termo.equipamento}`,
      `Data de emissão: ${termo.dataEmissao}`,
    ];

    for (const linha of linhas) {
      page.drawText(linha, { x: 50, y, size: 11, font });
      y -= 25;
    }

    const pdfBytes = await pdfDoc.save();
    this.baixarPdf(pdfBytes, `termo-${termo.nome}.pdf`);
    this.salvarNoHistorico(termo);
  }

  private salvarNoHistorico(termo: Termo): void {
    const historico = this.obterHistorico();
    historico.push(termo);
    localStorage.setItem('termos', JSON.stringify(historico));
  }

  obterHistorico(): Termo[] {
    const dados = localStorage.getItem('termos');
    return dados ? JSON.parse(dados) : [];
  }

  private baixarPdf(bytes: Uint8Array, nomeArquivo: string): void {
    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }
}