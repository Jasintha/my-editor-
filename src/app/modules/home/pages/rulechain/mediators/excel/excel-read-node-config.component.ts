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
    selector: 'tb-excelRead-node-config',
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
            parameterinputType: "",
            parameterparam: [],
            parameterproperty: [],
            parameterconstant: [],
            parameterreference:[],
            parameterbranch: [],
            errorMsg: "",
            errorAction: "",
            propertyinputType: "",
            propertyproperty: [],
            propertyreference: [],
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    ngOnInit(): void {
        this.addChildrenProperties()
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

    addChildrenProperties(){
        for (let modelprop of this.allModelProperties){
            let parent = modelprop.name
            if (modelprop.propertyType === "NEW" && modelprop.record === "m" && modelprop.propertyDataType === "MODEL"){
                for (let domModel of this.allDomainModelsWithSub){
                    if (modelprop.type === domModel.nameTitleCase){
                        for (let child of domModel.design.children){
                            let childProp = {
                                'name' : parent+"."+child.data.name,
                                'inputType' : child.data.type
                            }
                            this.allModelProperties.push(childProp)
                        }
                    }
                }
            }
            if (modelprop.record === "m"){
                for (let domModel of this.allDomainModelsWithSub){
                    if (modelprop.modelproperty.name === domModel.name){
                        for (let child of domModel.design.children){
                            let childProp = {
                                'name' : parent+"."+child.data.name,
                                'inputType' : child.data.type
                            }
                            this.allModelProperties.push(childProp)
                        }
                    }
                }
            }
        }
        for (let rerprop of this.allReferenceProperties){
            let parent = rerprop.name
            if (rerprop.record === "m"){
                for (let domModel of this.allDomainModelsWithSub){
                    if (rerprop.modelproperty.name === domModel.name){
                        for (let child of domModel.design.children){
                            let childProp = {
                                'name' : parent+"."+child.data.name,
                                'inputType' : child.data.type,
                                'modelproperty' : {
                                    'data': {
                                        'path' : child.data.path
                                    }
                                }
                            }
                            this.allReferenceProperties.push(childProp)
                        }
                    }
                }
            }
        }
        for (let rerprop of this.allRuleInputs){
            let parent = rerprop.name
            if (rerprop.record === "m"){
                for (let domModel of this.allDomainModelsWithSub){
                    if (rerprop.modelproperty.name === domModel.name){
                        for (let child of domModel.design.children){
                            let childProp = {
                                'name' : parent+"."+child.data.name,
                                'inputType' : child.data.type
                            }
                            this.allRuleInputs.push(childProp)
                        }
                    }
                }
            }
        }
        for (let rerprop of this.branchAvailability){
            let parent = rerprop.name
            if (rerprop.record === "m"){
                for (let domModel of this.allDomainModelsWithSub){
                    if (rerprop.modelproperty.name === domModel.name){
                        for (let child of domModel.design.children){
                            let childProp = {
                                'name' : parent+"."+child.data.name,
                                'inputType' : child.data.type
                            }
                            this.branchAvailability.push(childProp)
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

    refreshParameterInputTypes(){
        let inputType: string = this.excelReadNodeConfigFormGroup.get('parameterinputType').value;
        this.configuration.parameterinputType = inputType;
        if (inputType === 'RULE_INPUT'){
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.excelReadNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.parameterparam= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.excelReadNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.excelReadNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'CONSTANT'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterreference= {};
            this.excelReadNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        }  else if (inputType === 'REFERENCE'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.excelReadNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.excelReadNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    deleteRow(index: number): void{
        this.configuration.excelReadParameters.splice(index, 1);
        this.datasource = new MatTableDataSource(this.configuration.excelReadParameters);
        this.updateModel(this.configuration);
    }

    addParameter(): void{
        let inputType: string = this.excelReadNodeConfigFormGroup.get('parameterinputType').value;
        let colName = this.excelReadNodeConfigFormGroup.get('colName').value;

        if (inputType === 'RULE_INPUT'){
            let selectedParameterParam = this.excelReadNodeConfigFormGroup.get('parameterparam').value;
            let parameter = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterParam.inputName
            };
            this.configuration.excelReadParameters.push(parameter);
            this.updateModel(this.configuration);
        } else if (inputType === 'PROPERTY'){
            let selectedParameterProperty = this.excelReadNodeConfigFormGroup.get('parameterproperty').value;
            let parameterproperty = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.name
            };
            this.configuration.excelReadParameters.push(parameterproperty);
            this.updateModel(this.configuration);
        } else if (inputType === 'BRANCH_PARAM'){
            let selectedParameterBranch = this.excelReadNodeConfigFormGroup.get('parameterbranch').value;
            let parameterbranch = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterBranch.name
            };
            this.configuration.excelReadParameters.push(parameterbranch);
            this.updateModel(this.configuration);
        } else if (inputType === 'CONSTANT'){
            let selectedParameterConstant = this.excelReadNodeConfigFormGroup.get('parameterconstant').value;
            let parameterconstant = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterConstant.constantName
            };
            this.configuration.excelReadParameters.push(parameterconstant);
            this.updateModel(this.configuration);
        } else if (inputType === 'REFERENCE'){
            let selectedParameterReference = this.excelReadNodeConfigFormGroup.get('parameterreference').value;
            let parameterreference = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterReference.modelproperty.data.path
            };
            this.configuration.excelReadParameters.push(parameterreference);
            this.updateModel(this.configuration);
        }

        this.datasource = new MatTableDataSource(this.configuration.excelReadParameters);

        this.configuration.parameterinputType = '';
        this.configuration.parameterproperty= {};
        this.configuration.parameterbranch= {};
        this.configuration.parameterparam= {};
        this.configuration.parameterconstant= {};
        this.configuration.parameterreference= {};
        this.configuration.colName= '';

        this.excelReadNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
        this.excelReadNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
        this.excelReadNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
        this.excelReadNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        this.excelReadNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        this.excelReadNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
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
                parameterinputType: this.configuration.parameterinputType,
                parameterparam: this.configuration.parameterparam,
                parameterproperty: this.configuration.parameterproperty,
                parameterconstant: this.configuration.parameterconstant,
                parameterbranch: this.configuration.parameterbranch,
                parameterreference: this.configuration.parameterreference,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                propertyinputType: this.configuration.propertyinputType,
                propertyproperty: propertyproperty,
                propertyreference: propertyreference,
            });

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('sheetName').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.sheetName = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelinputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelinputType = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelbranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelbranch = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('excelreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelreference = configuration;
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

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterbranch = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelReadNodeConfigFormGroup.get('parameterreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterreference = configuration;
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
