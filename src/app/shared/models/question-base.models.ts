export class QuestionBase {
    value?: any;
    key?: string;
    label?: string;
    required?: boolean;
    order?: number;
    controlType?: string;
    type?: string;
    //options?: {key: string, value: string}[];
    options?: any[];
    modelSelectionFields?:ModelSelectionFields[];
    tableFields?:QuestionBase[]
    constructor(options: {
        value?: any;
        key?: string;
        label?: string;
        required?: boolean;
        order?: number;
        controlType?: string;
        type?: string;
        options?: any[];
        tableFields?:QuestionBase[]
        modelSelectionFields?:ModelSelectionFields[];

    } = {}) {
        this.value = options.value;
        this.key = options.key || '';
        this.label = options.label || '';
        this.required = !!options.required;
        this.order = options.order === undefined ? 1 : options.order;
        this.controlType = options.controlType || '';
        this.type = options.type || '';
        this.options = options.options || [];
        this.tableFields = options.tableFields || [];
        this.modelSelectionFields=options.modelSelectionFields;
    }
}

export class TextboxQuestion extends QuestionBase {
    controlType = 'textbox';
}

export class DropdownQuestion extends QuestionBase {
    controlType = 'dropdown';
}

export class ModelSelectionFields{
    type?: string;
    label?: string;
    name?: string;
}

export class ValueProperty {
    name?: string;
    type?: string;
    valueType?: string;
}
