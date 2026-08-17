import { Injectable } from '@angular/core';
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { Termo } from '../models/termo';

interface Segmento {
  texto: string;
  negrito?: boolean;
}

interface Palavra {
  texto: string;
  negrito: boolean;
  largura: number;
}

@Injectable({
  providedIn: 'root'
})
export class TermoPdfService {

  private readonly LARGURA_PAGINA = 595;
  private readonly MARGEM = 60;
  private readonly LARGURA_UTIL = this.LARGURA_PAGINA - this.MARGEM * 2;

  async gerarPdf(termo: Termo): Promise<void> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    let y = 800;
    const descer = (valor: number) => { y -= valor; };

    // Logo e cabeçalho institucional
    const logoBytes = await fetch('/logo-crea-sp.png').then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoLargura = 55;
    const logoAltura = (logoImage.height / logoImage.width) * logoLargura;
    page.drawImage(logoImage, {
      x: (this.LARGURA_PAGINA - logoLargura) / 2,
      y: y - logoAltura,
      width: logoLargura,
      height: logoAltura,
    });
    descer(logoAltura + 10);

    this.desenharCentralizado(page, 'SERVIÇO PÚBLICO FEDERAL', y, font, 10);
    descer(15);
    this.desenharCentralizado(page, 'CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA', y, fontBold, 11);
    descer(14);
    this.desenharCentralizado(page, 'DO ESTADO DE SÃO PAULO – CREA-SP', y, fontBold, 10);
    descer(30);

    // Título
    const tituloTermo = termo.tipoTermo === 'devolucao'
      ? '“TERMO DE DEVOLUÇÃO”'
      : '“TERMO DE RESPONSABILIDADE”';
    this.desenharCentralizadoSublinhado(page, tituloTermo, y, fontBold, 13);
    descer(22);

    const subtitulo = termo.tipoTermo === 'devolucao'
      ? 'DE EQUIPAMENTO DE INFORMÁTICA FORNECIDO PELO CREA-SP'
      : 'DE USO DE EQUIPAMENTO DE INFORMÁTICA FORNECIDO PELO CREA-SP';
    this.desenharCentralizado(page, subtitulo, y, fontBold, 10);
    descer(16);
    this.desenharCentralizado(page, 'DE PROPRIEDADE DA EMPRESA', y, fontBold, 10);
    descer(16);
    this.desenharCentralizado(page, 'SIMPRESS COMÉRCIO LOCAÇÃO E SERVIÇOS LTDA', y, fontBoldItalic, 10);
    descer(20);

    this.desenharLinha(page, y);
    descer(22);

    // Identificação do usuário
    this.desenharCentralizadoSublinhado(page, 'Identificação do usuário:', y, fontBoldItalic, 11);
    descer(24);
    this.desenharCampo(page, 'NOME: ', termo.nome, y, font, fontBoldItalic, 10);
    descer(16);
    this.desenharCampo(page, 'CARGO: ', termo.cargo, y, font, fontBoldItalic, 10);
    descer(16);
    this.desenharCampo(page, 'UNIDADE: ', termo.unidade || '-', y, font, fontBoldItalic, 10);
    descer(16);
    this.desenharCampo(page, 'REGISTRO/CREASP N°: ', termo.registroCrea || '-', y, font, fontBoldItalic, 10);
    descer(20);

    this.desenharLinha(page, y);
    descer(22);

    // Dados do equipamento
    this.desenharCentralizadoSublinhado(page, 'Dados do Equipamentos:', y, fontBoldItalic, 11);
    descer(24);
    this.desenharCampo(page, 'PATRIMÔNIO/SIMPRESS N°: ', termo.patrimonio, y, font, fontBoldItalic, 10);
    descer(16);
    this.desenharParagrafoJustificado(
      page,
      [{ texto: 'EQUIPAMENTO: ', negrito: true }, { texto: termo.equipamento }],
      y, font, fontBoldItalic, 10, (l) => descer(l)
    );
    descer(20);

    this.desenharLinha(page, y);
    descer(22);

    // Texto legal
    const paragrafos = this.textoLegal(termo.tipoTermo);
    for (const paragrafo of paragrafos) {
      this.desenharParagrafoJustificado(page, paragrafo, y, font, fontBold, 10, (l) => descer(l));
      descer(14);
    }

    descer(15);
    const dataExtenso = this.formatarDataExtenso();
    this.desenharCentralizado(page, `São Paulo, ${dataExtenso}.`, y, fontBold, 10);
    descer(70);

    const labelAssinatura = termo.tipoTermo === 'devolucao'
      ? 'Assinatura do Usuário'
      : 'Assinatura do Funcionário / Usuário';
    const larguraLinha = 320;
    const xLinha = (this.LARGURA_PAGINA - larguraLinha) / 2;
    page.drawLine({
      start: { x: xLinha, y },
      end: { x: xLinha + larguraLinha, y },
      thickness: 0.75,
      color: rgb(0, 0, 0),
    });
    descer(14);
    this.desenharCentralizado(page, labelAssinatura, y, font, 9);

    const pdfBytes = await pdfDoc.save();
    this.baixarPdf(pdfBytes, `termo-${termo.nome}.pdf`);
    this.salvarNoHistorico(termo);
  }

  private textoLegal(tipo: string): Segmento[][] {
    if (tipo === 'devolucao') {
      return [
        [
          { texto: 'Pelo presente ' },
          { texto: '“Termo de Devolução”', negrito: true },
          { texto: ', nesta data o funcionário acima identificado, aqui designado ' },
          { texto: '“USUÁRIO”', negrito: true },
          { texto: ', devolve o equipamento e seus acessórios supracitados que se encontrava sob sua responsabilidade de propriedade da empresa ' },
          { texto: 'SIMPRESS COMÉRCIO LOCAÇÃO E SERVIÇOS LTDA', negrito: true },
          { texto: '.' },
        ],
        [
          { texto: 'E por estar de pleno acordo com o que aqui foi descrito, assina o usuário o presente ' },
          { texto: '“Termo de Devolução”', negrito: true },
          { texto: '.' },
        ],
      ];
    }
    return [
      [
        { texto: 'Pelo presente ' },
        { texto: '“Termo de Responsabilidade”', negrito: true },
        { texto: ', a Superintendência de Tecnologia e Inovação – SUPTEC entrega, nesta data ao funcionário acima identificado, aqui designado ' },
        { texto: '“USUÁRIO”', negrito: true },
        { texto: ', o equipamento e seus acessórios supracitados de propriedade da ' },
        { texto: 'SIMPRESS COMÉRCIO LOCAÇÃO E SERVIÇOS LTDA', negrito: true },
        { texto: ', que lhes foram entregues em perfeitas condições, para uso exclusivo no desempenho de suas funções no CREA-SP, devendo ser ' },
        { texto: 'devolvidos', negrito: true },
        { texto: ', mediante ' },
        { texto: '“Termo de Devolução”', negrito: true },
        { texto: '.' },
      ],
      [{ texto: 'Fica estabelecido que, em caso roubo, furto ou outra situação de sinistro que acarrete a indisponibilidade dos equipamentos, o usuário deverá comunicar o fato imediata e formalmente à sua chefia, registrando o ocorrido, quando for o caso se obrigará a elaborar um BOLETIM de OCORRÊNCIA (BO) e encaminhar uma cópia para a Unidade de Infraestrutura, Modernização e Segurança da Informação – UINFRA, para medidas cabíveis.' }],
      [{ texto: 'É dever de todo funcionário do CREA-SP cuidar e zelar pelo bom uso e guarda, conservação e aplicação de recursos e bens patrimoniais do Conselho, sob seus cuidados e administração, caracterizando falta funcional o descumprimento de tal dever.' }],
      [
        { texto: 'E por estar de pleno acordo com o que aqui foi estabelecido, assina o usuário o presente ' },
        { texto: '“Termo de Responsabilidade”', negrito: true },
        { texto: '.' },
      ],
    ];
  }

  private desenharCentralizado(page: any, texto: string, y: number, font: PDFFont, tamanho: number): void {
    const largura = font.widthOfTextAtSize(texto, tamanho);
    const x = (this.LARGURA_PAGINA - largura) / 2;
    page.drawText(texto, { x, y, size: tamanho, font });
  }

  private desenharCentralizadoSublinhado(page: any, texto: string, y: number, font: PDFFont, tamanho: number): void {
    const largura = font.widthOfTextAtSize(texto, tamanho);
    const x = (this.LARGURA_PAGINA - largura) / 2;
    page.drawText(texto, { x, y, size: tamanho, font });
    page.drawLine({
      start: { x, y: y - 2 },
      end: { x: x + largura, y: y - 2 },
      thickness: 0.75,
      color: rgb(0, 0, 0),
    });
  }

  private desenharLinha(page: any, y: number): void {
    page.drawLine({
      start: { x: this.MARGEM, y },
      end: { x: this.LARGURA_PAGINA - this.MARGEM, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  private desenharCampo(page: any, label: string, valor: string, y: number, font: PDFFont, fontLabel: PDFFont, tamanho: number): void {
    page.drawText(label, { x: this.MARGEM, y, size: tamanho, font: fontLabel });
    const larguraLabel = fontLabel.widthOfTextAtSize(label, tamanho);
    page.drawText(valor, { x: this.MARGEM + larguraLabel, y, size: tamanho, font });
  }

  private quebrarSegmentos(segmentos: Segmento[], font: PDFFont, fontBold: PDFFont, tamanho: number, larguraMax: number): Palavra[][] {
    const palavras: Palavra[] = [];
    for (const seg of segmentos) {
      for (const palavra of seg.texto.split(' ')) {
        if (!palavra) continue;
        const fonteAtual = seg.negrito ? fontBold : font;
        palavras.push({ texto: palavra, negrito: !!seg.negrito, largura: fonteAtual.widthOfTextAtSize(palavra, tamanho) });
      }
    }

    const linhas: Palavra[][] = [];
    let linhaAtual: Palavra[] = [];
    let larguraAtual = 0;
    const espacoLargura = font.widthOfTextAtSize(' ', tamanho);

    for (const palavra of palavras) {
      const adicional = linhaAtual.length > 0 ? espacoLargura + palavra.largura : palavra.largura;
      if (larguraAtual + adicional > larguraMax && linhaAtual.length > 0) {
        linhas.push(linhaAtual);
        linhaAtual = [palavra];
        larguraAtual = palavra.largura;
      } else {
        linhaAtual.push(palavra);
        larguraAtual += adicional;
      }
    }
    if (linhaAtual.length > 0) linhas.push(linhaAtual);
    return linhas;
  }

  private desenharParagrafoJustificado(
    page: any,
    segmentos: Segmento[],
    yInicial: number,
    font: PDFFont,
    fontBold: PDFFont,
    tamanho: number,
    aoDescerLinha: (altura: number) => void
  ): void {
    const linhas = this.quebrarSegmentos(segmentos, font, fontBold, tamanho, this.LARGURA_UTIL);
    let y = yInicial;
    const espacoNormal = font.widthOfTextAtSize(' ', tamanho);

    linhas.forEach((linha, indice) => {
      const ultimaLinha = indice === linhas.length - 1;
      const larguraPalavras = linha.reduce((soma, p) => soma + p.largura, 0);
      const espacosNaLinha = linha.length - 1;

      const espacoUsado = (!ultimaLinha && espacosNaLinha > 0)
        ? (this.LARGURA_UTIL - larguraPalavras) / espacosNaLinha
        : espacoNormal;

      let x = this.MARGEM;
      for (const palavra of linha) {
        const fonteAtual = palavra.negrito ? fontBold : font;
        page.drawText(palavra.texto, { x, y, size: tamanho, font: fonteAtual });
        x += palavra.largura + espacoUsado;
      }

      y -= 15;
      aoDescerLinha(15);
    });
  }

  private formatarDataExtenso(): string {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const hoje = new Date();
    return `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
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