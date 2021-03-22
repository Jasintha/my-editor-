import {
    AfterViewInit,
    Component,
    ComponentRef,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    EventEmitter,
    ViewChild,
    Inject,
    ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators, AbstractControl } from '@angular/forms';
import {
    IRuleNodeConfigurationComponent,
    RuleNodeConfiguration,
    RuleNodeDefinition
} from '@shared/models/rule-node.models';
import { Subscription } from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TranslateService } from '@ngx-translate/core';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';
import { deepClone } from '@core/utils';
import { Observable } from 'rxjs';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';

@Component({
    selector: 'virtuan-excelRead-node-config',
    templateUrl: './excel-read-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ExcelReadNodeConfigComponent),
        multi: true
    }]
})
export class ExcelReadNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

    @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

    private requiredValue: boolean;
    get required(): boolean {
        return this.requiredValue;
    }


    @Input()
    set required(value: boolean) {
        this.requiredValue = coerceBooleanProperty(value);
    }

    @Input()
    disabled: boolean;

    @Input()
    ruleNodeId: string;

    @Input()
    inputEntities: any[];

    @Input()
    allRuleInputs: any[];

    @Input()
    allVariables: any[];


    @Input()
    allDomainModelsWithSub: any[];

    @Input()
    inputProperties: any[];

    @Input()
    allConstants: any[];

    @Input()
    inputCustomobjects: any[];

    @Input()
    allModelProperties: any[];

    @Input() branchAvailability: any;

    @Input()
    allReferenceProperties: any[];

    @Input()
    apptype: string;

    nodeDefinitionValue: RuleNodeDefinition;

    @Input()
    set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
        if (this.nodeDefinitionValue !== nodeDefinition) {
            this.nodeDefinitionValue = nodeDefinition;
            if (this.nodeDefinitionValue) {
                // this.validateDefinedDirective();
            }
        }
    }

    get nodeDefinition(): RuleNodeDefinition {
        return this.nodeDefinitionValue;
    }

    definedDirectiveError: string;

    excelReadNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    datasource: MatTableDataSource<ExcelReadParameter>;

    displayedColumns: string[] = ['colName', 'inputType', 'input', 'property', 'actions'];

    ChildrenOfSelectedProperty : any[] = [];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.excelReadNodeConfigFormGroup = this.fb.group({
            colName: "",
            inputType: [],
            //record: [],
            //customObject: [],
            sheetName : "",
            excelinputType:"",
            excelparam: [],
            excelproperty : [],
            excelbranch: [],
            excelconstant: [],
            excelreference: [],
            errorMsg: "",
            errorAction: "",
            propertyinputType: "",
            propertyproperty: [],
            propertyreference: [],
            excelFileInputType: "",
            url: "",
            childrenParam: []
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this.definedConfigComponentRef) {
            this.definedConfigComponentRef.destroy();
        }
    }

    ngAfterViewInit(): void {
    }

    refreshInputTypes(){
        let inputType: string = this.excelReadNodeConfigFormGroup.get('propertyinputType').value;
        this.configuration.propertyinputType = inputType;

        if (inputType === 'PROPERTY'){
            this.configuration.propertyreference= {};
            this.excelReadNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
        } else if (inputType === 'REFERENCE'){
            this.configuration.propertyproperty= {};
            this.excelReadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    addChildrenProperties(modelprop, propertyType){

        if (propertyType === "valueProperty") {
            let parent = modelprop.name
            for (let domModel of this.allDomainModelsWithSub) {
                if (modelprop.type === domModel.nameTitleCase) {
                    for (let child of domModel.design.children) {
                        let childProp = {
                            'name': parent + "." + child.data.name,
                            'inputType': child.data.type,
                            'childName': child.data.name
                        }
                        this.ChildrenOfSelectedProperty.push(childProp)
                    }
                }
            }
        } else if (propertyType === "reference") {
            let parent = modelprop.name
            if (modelprop.record === "m"){
                for (let domModel of this.allDomainModelsWithSub){
                    if (modelprop.modelproperty.name === domModel.name){
                        for (let child of domModel.design.children){
                            let childProp = {
                                'name' : parent+"."+child.data.name,
                                'inputType' : child.data.type,
                                'childName': child.data.name,
                                'modelproperty' : {
                                    'data': {
                                        'path' : child.data.path
                                    }
                                }
                            }
                            this.ChildrenOfSelectedProperty.push(childProp)
                        }
                    }
                }
            }
        }

    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.excelReadNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.excelReadNodeConfigFormGroup.enable({emitEvent: false});
        }
    }

    deleteRow(index: number): void{
        this.configuration.excelReadParameters.splice(index, 1);
        this.datasource = new MatTableDataSource(this.configuration.excelReadParameters);
        this.updateModel(this.configuration);
    }

    addParameter(): void{   // todo : should be changed according to new parameters
        let inputType: string = this.excelReadNodeConfigFormGroup.get('excelinputType').value;
        let colName = this.excelReadNodeConfigFormGroup.get('colName').value;

        console.log("@@@@@@@@@@@@@@@@",inputType,colName)

        if (inputType === 'PROPERTY') {
            let selectedParameterProperty = this.excelReadNodeConfigFormGroup.get('childrenParam').value;
            let parameterproperty = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.name
            };
            console.log("****************", parameterproperty)
            this.configuration.excelReadParameters.push(parameterproperty);
            this.datasource = new MatTableDataSource(this.configuration.excelReadParameters);
            this.updateModel(this.configuration);
        } else if (inputType === 'REFERENCE') {
            let selectedParameterProperty = this.excelReadNodeConfigFormGroup.get('childrenParam').value;
            let parameterproperty = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.modelproperty.data.path
            };
            console.log("****************", parameterproperty)
            this.configuration.excelReadParameters.push(parameterproperty);
            this.datasource = new MatTableDataSource(this.configuration.excelReadParameters);
            this.updateModel(this.configuration);
        }

        this.configuration.childrenParam= {};
        this.configuration.colName= '';

        this.excelReadNodeConfigFormGroup.get('childrenParam').patchValue([], {emitEvent: false});
        this.excelReadNodeConfigFormGroup.get('colName').patchValue([], {emitEvent: false});

        this.setExcelReadInput()

    }

    setExcelReadInput(): void {

        let inputType: string = this.excelReadNodeConfigFormGroup.get('excelinputType').value;
        let sheetName = this.excelReadNodeConfigFormGroup.get('sheetName').value;

        if (inputType === 'RULE_INPUT') {
            let selectedParameterParam = this.excelReadNodeConfigFormGroup.get('excelparam').value;
            let parameter = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterParam.inputName
            };
            this.configuration.excelReadInput = parameter;
            this.updateModel(this.configuration);
        } else if (inputType === 'PROPERTY') {
            let selectedParameterProperty = this.excelReadNodeConfigFormGroup.get('excelproperty').value;
            let parameterproperty = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.name
            };
            this.configuration.excelReadInput = parameterproperty;
            this.updateModel(this.configuration);
        } else if (inputType === 'BRANCH_PARAM') {
            let selectedParameterBranch = this.excelReadNodeConfigFormGroup.get('excelbranch').value;
            let parameterbranch = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterBranch.name
            };
            this.configuration.excelReadInput = parameterbranch;
            this.updateModel(this.configuration);
        } else if (inputType === 'CONSTANT') {
            let selectedParameterConstant = this.excelReadNodeConfigFormGroup.get('excelconstant').value;
            let parameterconstant = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterConstant.constantName
            };
            this.configuration.excelReadInput = parameterconstant;
            this.updateModel(this.configuration);
        } else if (inputType === 'REFERENCE') {
            let selectedParameterReference = this.excelReadNodeConfigFormGroup.get('excelreference').value;
            let parameterreference = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterReference.modelproperty.data.path
            };
            this.configuration.excelReadInput = parameterreference;
            this.updateModel(this.configuration);
        }

    }

    writeValue(value: RuleNodeConfiguration): void {

        this.configuration = deepClone(value);
        if(this.configuration.excelReadParameters === null || this.configuration.excelReadParameters === undefined){
            this.configuration.excelReadParameters = [];
        }

        if(this.configuration.excelReadInput === null || this.configuration.excelReadInput === undefined){
            this.configuration.excelReadInput = {};
        }

        this.datasource = new MatTableDataSource(this.configuration.excelReadParameters);
        if (this.changeSubscription) {
            this.changeSubscription.unsubscribe();
            this.changeSubscription = null;
        }
        if (this.definedConfigComponent) {
            this.definedConfigComponent.configuration = this.configuration;
            this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
                this.updateModel(configuration);
            });
        } else {
            let excelbranch = this.configuration.excelbranch;
            if(this.configuration.excelinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
                excelbranch = this.allModelProperties.find(x => x.name === this.configuration.excelbranch.name );
            }

            let excelparam = this.configuration.excelparam;
            if(this.configuration.excelinputType === 'RULE_INPUT' && this.allRuleInputs){
                excelparam = this.allRuleInputs.find(x => x.inputName === this.configuration.excelparam.inputName );
            }

            let excelconstant = this.configuration.excelconstant;
            if(this.configuration.excelinputType === 'CONSTANT' && this.allConstants){
                excelconstant = this.allConstants.find(x => x.constantName === this.configuration.excelconstant.constantName );
            }

            let excelproperty = this.configuration.excelproperty;
            if(this.configuration.excelinputType === 'PROPERTY' && this.allModelProperties){
                excelproperty = this.allModelProperties.find(x => x.name === this.configuration.excelproperty.name );
            }

            let excelreference = this.configuration.excelreference;
            if(this.configuration.excelinputType === 'REFERENCE' && this.allReferenceProperties){
                excelreference = this.allReferenceProperties.find(x => x.name === this.configuration.excelreference.name );
            }

            let propertyproperty = this.configuration.propertyproperty;
            if(this.configuration.propertyinputType === 'PROPERTY' && this.allModelProperties){
                propertyproperty = this.allModelProperties.find(x => x.name === this.configuration.propertyproperty.name );
            }

            let propertyreference = this.configuration.propertyreference;
            if(this.configuration.propertyinputType === 'REFERENCE' && this.allReferenceProperties){
                propertyreference = this.allModelProperties.find(x => x.name === this.configuration.propertyreference.name );
            }

            this.excelReadNodeConfigFormGroup.patchValue({
                inputType: this.configuration.inputType,
                colName: this.configuration.colName,
                //record: this.configuration.record,
                //customObject: customObject,
                sheetName : this.configuration.sheetName,
                excelinputType:this.configuration.excelinputType,
                excelparam: excelparam,
                excelproperty : excelproperty,
                excelbranch: excelbranch,
                excelconstant: excelconstant,
                excelreference: excelreference,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                propertyinputType: this.configuration.propertyinputType,
                propertyproperty: propertyproperty,
                propertyreference: propertyreference,
                excelFileInputType: this.configuration.excelFileInputType,
                url: this.configuration.url,
                childrenParam: this.configuration.childrenParam
            });

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('childrenParam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.childrenParam = configuration;
                    console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{", configuration)
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('url').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.url = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelFileInputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelFileInputType = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('sheetName').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.sheetName = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelinputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelinputType = configuration;
                    console.log("excel input type ----- ",configuration)
                    this.ChildrenOfSelectedProperty = [];

                    if (this.configuration.excelinputType == 'RULE_INPUT'){
                        this.configuration.excelproperty = {};
                        this.configuration.excelbranch = {};
                        this.configuration.excelconstant = {};
                        this.configuration.excelreference = {};
                        this.excelReadNodeConfigFormGroup.get('excelproperty').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelbranch').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelconstant').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelreference').patchValue([], {emitEvent: false});
                    } else if (this.configuration.excelinputType == 'PROPERTY'){
                        this.configuration.excelparam = {};
                        this.configuration.excelbranch = {};
                        this.configuration.excelconstant = {};
                        this.configuration.excelreference = {};
                        this.excelReadNodeConfigFormGroup.get('excelparam').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelbranch').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelconstant').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelreference').patchValue([], {emitEvent: false});
                    } else if (this.configuration.excelinputType == 'CONSTANT'){
                        this.configuration.excelproperty = {};
                        this.configuration.excelbranch = {};
                        this.configuration.excelparam = {};
                        this.configuration.excelreference = {};
                        this.excelReadNodeConfigFormGroup.get('excelproperty').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelbranch').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelparam').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelreference').patchValue([], {emitEvent: false});
                    } else if (this.configuration.excelinputType == 'BRANCH_PARAM'){
                        this.configuration.excelproperty = {};
                        this.configuration.excelparam = {};
                        this.configuration.excelconstant = {};
                        this.configuration.excelreference = {};
                        this.excelReadNodeConfigFormGroup.get('excelproperty').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelparam').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelconstant').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelreference').patchValue([], {emitEvent: false});
                    } else if (this.configuration.excelinputType == 'REFERENCE'){
                        this.configuration.excelproperty = {};
                        this.configuration.excelbranch = {};
                        this.configuration.excelconstant = {};
                        this.configuration.excelparam = {};
                        this.excelReadNodeConfigFormGroup.get('excelproperty').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelbranch').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelconstant').patchValue([], {emitEvent: false});
                        this.excelReadNodeConfigFormGroup.get('excelparam').patchValue([], {emitEvent: false});
                    }

                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelparam = configuration;
                    this.ChildrenOfSelectedProperty = [];
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelproperty = configuration;
                    this.ChildrenOfSelectedProperty = [];
                    this.addChildrenProperties(configuration,"valueProperty")
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelbranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelbranch = configuration;
                    this.ChildrenOfSelectedProperty = [];
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelconstant = configuration;
                    this.ChildrenOfSelectedProperty = [];
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelreference = configuration;
                    this.ChildrenOfSelectedProperty = [];
                    this.addChildrenProperties(configuration,"reference")
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorMsg = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorAction = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('propertyinputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyinputType = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyreference = configuration;
                    this.updateModel(this.configuration);
                }
            );
        }
    }
    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.excelReadNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}

export interface ExcelReadParameter {
    colName: string;
    inputType: string;
    input: string;
    property: string;
}
