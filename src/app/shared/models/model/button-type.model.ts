export interface IActions {
    buttons?: IButtons;
}

export class Actions implements IActions {
    constructor(public buttons?: IButtons,
    ) {}
}

export interface IButtons {
    child?: IButtonType[];
    Align?: string;
}

export class Buttons implements IButtons {
    constructor(public child?: IButtonType[],
                public Align?: string,
    ) {}
}


export interface IButtonType {
    id?: string;
    caption?: string;
    resourcePath?: string;
    operation?: string;
    color?: string;
    tooltip?: string;
    pageId?: string;
    pageName?: string;
}

export class ButtonType implements IButtonType {
    constructor(public id?: string,
                public caption?: string,
                public resourcePath?: string,
                public operation?: string,
                public color?: string,
                public tooltip?: string,
                public pageId?: string,
                public pageName?: string,
    ) {}
}