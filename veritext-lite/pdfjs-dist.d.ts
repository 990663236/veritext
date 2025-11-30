// pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf" {
  export interface PDFWorkerOptions {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: PDFWorkerOptions;

  export function getDocument(src: any): {
    promise: Promise<any>;
  };

  export const version: string;
  export const build: string;
}
