export interface IFileDownloader {
  pagetitle?: string;
  templateType?: string;
}

export class FileDownloader implements IFileDownloader {
  constructor(public pagetitle?: string, public templateType?: string) {}
}
