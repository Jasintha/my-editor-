export interface IFlexGrid {
    name?: string;
    rows?: IRow[];
}

export class FlexGrid implements IFlexGrid {
    constructor(public name?: string, public rows?: IRow[]) {}
}

export interface IRow {
    height?: number,
    columns?: IColumn[];
}

export class Row implements IRow {
    constructor(public height?: number, public columns?: IColumn[]) {}
}

export interface IColumn {
isContainer?: boolean;
id?: string;
grid? : IFlexGrid;
columnSize?: number;
}

export class Column implements IColumn {
    constructor(public isContainer?: boolean, public id?: string,
                public grid?: IFlexGrid, public columnSize?: number) {}
}


export interface IGridPageMapping {
    pageId?: string;
    pageName? : string;
    refId?: string;
}

export class GridPageMapping implements IGridPageMapping {
    constructor(public pageId?: string, public pageName?: string,
                public refId?: string) {}
}