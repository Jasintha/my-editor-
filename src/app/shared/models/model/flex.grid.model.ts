export interface IFlexGrid {
    name?: string;
    rows?: IRow[];
}

export class FlexGrid implements IFlexGrid {
    constructor(public name?: string, public rows?: IRow[]) {}
}

export interface IRow {
    columns?: IColumn[];
}

export class Row implements IRow {
    constructor(public columns?: IColumn[]) {}
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
