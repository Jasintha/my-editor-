
export interface IExtCodeUploads {
  uuid?: string;
  pagetitle?: string;
  templateType?: string;
  projectUuid?: string;
  status?: string;
}

export class ExtCodeUploads implements IExtCodeUploads {
  constructor(
    public uuid?: string,
    public pagetitle?: string,
    public templateType?: string,
    public projectUuid?: string,
    public status?: string
  ) {}
}
