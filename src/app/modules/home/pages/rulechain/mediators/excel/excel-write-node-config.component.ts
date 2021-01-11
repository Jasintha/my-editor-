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
    selector: 'tb-excelWrite-node-config',
    templateUrl: './excel-write-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ExcelWriteNodeConfigComponent),
        multi: true
    }]
})
export class ExcelWriteNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

    excelWriteNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    datasource: MatTableDataSource<ExcelWriteParameter>;

    displayedColumns: string[] = ['colName', 'inputType', 'input', 'property', 'actions'];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.excelWriteNodeConfigFormGroup = this.fb.group({
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
            assignedProperty: [],
            errorMsg: "",
            errorAction: "",
            assignedtoinputType: "",
            assignedReference: []
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
            this.excelWriteNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.excelWriteNodeConfigFormGroup.enable({emitEvent: false});
        }
    }

    refreshParameterInputTypes(){
        let inputType: string = this.excelWriteNodeConfigFormGroup.get('parameterinputType').value;
        this.configuration.parameterinputType = inputType;
        if (inputType === 'RULE_INPUT'){
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.excelWriteNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.parameterparam= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.excelWriteNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.excelWriteNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'CONSTANT'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterreference= {};
            this.excelWriteNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        }  else if (inputType === 'REFERENCE'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.excelWriteNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.excelWriteNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    deleteRow(index: number): void{
        this.configuration.excelWriteParameters.splice(index, 1);
        this.datasource = new MatTableDataSource(this.configuration.excelWriteParameters);
        this.updateModel(this.configuration);
    }

    addParameter(): void{
        let inputType: string = this.excelWriteNodeConfigFormGroup.get('parameterinputType').value;
        let colName = this.excelWriteNodeConfigFormGroup.get('colName').value;

        if (inputType === 'RULE_INPUT'){
            let selectedParameterParam = this.excelWriteNodeConfigFormGroup.get('parameterparam').value;
            let parameter = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterParam.inputName
            };
            this.configuration.excelWriteParameters.push(parameter);
            this.updateModel(this.configuration);
        } else if (inputType === 'PROPERTY'){
            let selectedParameterProperty = this.excelWriteNodeConfigFormGroup.get('parameterproperty').value;
            let parameterproperty = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.name
            };
            this.configuration.excelWriteParameters.push(parameterproperty);
            this.updateModel(this.configuration);
        } else if (inputType === 'BRANCH_PARAM'){
            let selectedParameterBranch = this.excelWriteNodeConfigFormGroup.get('parameterbranch').value;
            let parameterbranch = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterBranch.name
            };
            this.configuration.excelWriteParameters.push(parameterbranch);
            this.updateModel(this.configuration);
        } else if (inputType === 'CONSTANT'){
            let selectedParameterConstant = this.excelWriteNodeConfigFormGroup.get('parameterconstant').value;
            let parameterconstant = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterConstant.constantName
            };
            this.configuration.excelWriteParameters.push(parameterconstant);
            this.updateModel(this.configuration);
        } else if (inputType === 'REFERENCE'){
            let selectedParameterReference = this.excelWriteNodeConfigFormGroup.get('parameterreference').value;
            let parameterreference = {
                'colName': colName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterReference.modelproperty.data.path
            };
            this.configuration.excelWriteParameters.push(parameterreference);
            this.updateModel(this.configuration);
        }

        this.datasource = new MatTableDataSource(this.configuration.excelWriteParameters);

        this.configuration.parameterinputType = '';
        this.configuration.parameterproperty= {};
        this.configuration.parameterbranch= {};
        this.configuration.parameterparam= {};
        this.configuration.parameterconstant= {};
        this.configuration.parameterreference= {};
        this.configuration.colName= '';

        this.excelWriteNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
        this.excelWriteNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
        this.excelWriteNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
        this.excelWriteNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        this.excelWriteNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        this.excelWriteNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
        this.excelWriteNodeConfigFormGroup.get('colName').patchValue([], {emitEvent: false});

        this.setExcelWriteInputData()

    }

    setExcelWriteInputData(): void {

        let inputType: string = this.excelWriteNodeConfigFormGroup.get('excelinputType').value;
        let sheetName = this.excelWriteNodeConfigFormGroup.get('sheetName').value;

        if (inputType === 'RULE_INPUT') {
            let selectedParameterParam = this.excelWriteNodeConfigFormGroup.get('excelparam').value;
            let parameter = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterParam.inputName
            };
            this.configuration.excelWriteInput = parameter;
            this.updateModel(this.configuration);
        } else if (inputType === 'PROPERTY') {
            let selectedParameterProperty = this.excelWriteNodeConfigFormGroup.get('excelproperty').value;
            let parameterproperty = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.name
            };
            this.configuration.excelWriteInput = parameterproperty;
            this.updateModel(this.configuration);
        } else if (inputType === 'BRANCH_PARAM') {
            let selectedParameterBranch = this.excelWriteNodeConfigFormGroup.get('excelbranch').value;
            let parameterbranch = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterBranch.name
            };
            this.configuration.excelWriteInput = parameterbranch;
            this.updateModel(this.configuration);
        } else if (inputType === 'CONSTANT') {
            let selectedParameterConstant = this.excelWriteNodeConfigFormGroup.get('excelconstant').value;
            let parameterconstant = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterConstant.constantName
            };
            this.configuration.excelWriteInput = parameterconstant;
            this.updateModel(this.configuration);
        } else if (inputType === 'REFERENCE') {
            let selectedParameterReference = this.excelWriteNodeConfigFormGroup.get('excelreference').value;
            let parameterreference = {
                'sheetName': sheetName,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterReference.modelproperty.data.path
            };
            this.configuration.excelWriteInput = parameterreference;
            this.updateModel(this.configuration);
        }

    }

    writeValue(value: RuleNodeConfiguration): void {


        this.configuration = deepClone(value);
        if(this.configuration.excelWriteParameters === null || this.configuration.excelWriteParameters === undefined){
            this.configuration.excelWriteParameters = [];
        }

        if(this.configuration.excelWriteInput === null || this.configuration.excelWriteInput === undefined){
            this.configuration.excelWriteInput = {};
        }

        this.datasource = new MatTableDataSource(this.configuration.excelWriteParameters);

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
            let assignedProperty = this.configuration.assignedProperty;
            if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
                assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
            }

            let assignedReference = this.configuration.assignedReference;
            if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
                assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
            }

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

            this.excelWriteNodeConfigFormGroup.patchValue({
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
                assignedProperty: assignedProperty,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                assignedtoinputType: this.configuration.assignedtoinputType,
                assignedReference: assignedReference
            });

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('sheetName').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.sheetName = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('excelinputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelinputType = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('excelparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('excelproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('excelbranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelbranch = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('excelconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('excelreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelreference = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorMsg = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorAction = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.assignedProperty = configuration;
                    this.updateModel(this.configuration);
                }
            );
            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterbranch = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('parameterreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterreference = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.assignedReference = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelWriteNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
                (configuration: RuleNodeConfiguration) => {

                    this.configuration.assignedtoinputType = configuration;
                    if(this.configuration.assignedtoinputType == 'PROPERTY'){
                        this.configuration.assignedReference= {};
                        this.excelWriteNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
                    }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
                        this.configuration.assignedProperty= {};
                        this.excelWriteNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
                    }
                    this.updateModel(this.configuration);
                }
            );
        }
    }
    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.excelWriteNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}

export interface ExcelWriteParameter {
    colName: string;
    inputType: string;
    input: string;
    property: string;
}
