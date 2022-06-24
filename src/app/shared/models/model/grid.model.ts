import { IWidget } from './widget.model';

export interface IGrid {
  name?: string;
  rows?: IRow[];
}

export class Grid implements IGrid {
  constructor(public name?: string, public rows?: IRow[]) {}
}

export interface IRow {
  containers?: IContainer[];
}

export class Row implements IRow {
  constructor(public containers?: IContainer[]) {}
}

export interface IContainer {
  containerCols?: any;
  page?: string;
  pagetitle?: string;
  pagetype?: string;
}

export class Container implements IContainer {
  constructor(public containerCols?: number, public page?: string, public pagetitle?: string, public pagetype?: string) {}
}
