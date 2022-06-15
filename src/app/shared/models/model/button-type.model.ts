export interface IButtonType {
    id?: string;
    caption?: string;
    resourcePath?: string;
    operation?: string;
    color?: string;
    tooltip?: string;
}

export class ButtonType implements IButtonType {
    constructor(public id?: string,
                public caption?: string,
                public resourcePath?: string,
                public operation?: string,
                public color?: string,
                public tooltip?: string,
    ) {}
}