declare module 'html2pdf.js' {
  type Html2PdfOptions = {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: Record<string, unknown>;
  };

  interface Html2PdfWorker {
    from(element: HTMLElement): Html2PdfWorker;
    set(options: Html2PdfOptions): Html2PdfWorker;
    outputPdf(type: 'datauristring'): Promise<string>;
    outputPdf(type: 'blob'): Promise<Blob>;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfWorker;
  export default html2pdf;
}