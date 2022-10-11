export interface IPropertyKeyValue {
    key?: string;
    name?: string;
    value?: string;
    description?: string;
}

export class PropertyKeyValue implements IPropertyKeyValue {
    constructor(public key?: string,
                public name?: string,
                public value?: string,
                public description?: string
    ) {}
}
