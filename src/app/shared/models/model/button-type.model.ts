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
    uuid?: string;
    caption?: string;
    resourcePath?: string;
    operation?: string;
    color?: string;
    tooltip?: string;
    pageId?: string;
    pageName?: string;
    buttonEvents?: IButtonEvent[]
}

export class ButtonType implements IButtonType {
    constructor(public uuid?: string,
                public caption?: string,
                public resourcePath?: string,
                public operation?: string,
                public color?: string,
                public tooltip?: string,
                public pageId?: string,
                public pageName?: string,
                public buttonEvents?: IButtonEvent[]
    ) {}
}

export interface IButtonEvent {
    id?: string;
    btnCaption?: string;
    btnId?: string;
    resourcePath?: string;
    event?: string;
    eventAction?: string;
    pageId?: string;
    pageName?: string;
}

export class ButtonEvent implements IButtonEvent {
    constructor(
    public id?: string,
    public btnCaption?: string,
    public  btnId?: string,
    public resourcePath?: string,
    public event?: string,
    public eventAction?: string,
    public pageId?: string,
    ) {}
}