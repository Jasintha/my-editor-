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
    selector: 'virtuan-pdf-node-config',
    templateUrl: './pdf-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PdfNodeConfigComponent),
        multi: true
    }]
})
export class PdfNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
    allRoots: any[];

    @Input()
    allSubRules: any[];

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
    allPdfs: any[];

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

    pdfNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    datasource: MatTableDataSource<PdfParameters>;

    displayedColumns: string[] = ['key', 'inputType', 'input', 'property', 'actions'];

    errordatasource: MatTableDataSource<ErrorFunctionParameters>;
    displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.pdfNodeConfigFormGroup = this.fb.group({
            key: [],
            inputType: [],
            //record: [],
            //customObject: [],
            pdf: [],
            parameterinputType: [],
            parameterparam: [],
            parameterproperty: [],
            parameterconstant: [],
            parameterreference:[],
            parameterbranch: [],
            assignedProperty: [],
            errorMsg: "",
            errorAction: "",
            assignedtoinputType: "",
            assignedReference: [],
            errorBranch: [],
            errorInputType: [],
            errorIsAsync: false,
            errorBranchparameter: [],
            errorParameterinputType: [],
            errorParameterparam: [],
            errorParameterproperty: [],
            errorParameterbranchparam: [],
            isReturn: false
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
                                'inputType' : child.data.type,
                                'childName': child.data.name
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
                                'inputType' : child.data.type,
                                'childName': child.data.name,
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
                                'childName': child.data.name,
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
                                'inputType' : child.data.type,
                                'childName': child.data.name
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
                                'inputType' : child.data.type,
                                'childName': child.data.name
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
            this.pdfNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.pdfNodeConfigFormGroup.enable({emitEvent: false});
        }
    }

    refreshErrorParameterInputTypes(){
        let errorInputType: string = this.pdfNodeConfigFormGroup.get('errorParameterinputType').value;
        this.configuration.errorParameterinputType = errorInputType;
        if (errorInputType === 'RULE_INPUT'){
            this.configuration.errorParameterproperty= {};
            this.configuration.errorParameterbranchparam= {};
            this.pdfNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
        } else if (errorInputType === 'PROPERTY'){
            this.configuration.errorParameterparam= {};
            this.configuration.errorParameterbranchparam= {};
            this.pdfNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
        } else if (errorInputType === 'BRANCH_PARAM'){
            this.configuration.errorParameterparam= {};
            this.configuration.errorParameterproperty= {};
            this.pdfNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
        } else if (errorInputType === 'ERROR'){
          this.configuration.errorParameterbranchparam= {};
          this.configuration.errorParameterparam= {};
          this.configuration.errorParameterproperty= {};
          this.pdfNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
          this.pdfNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
          this.pdfNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    refreshParameterInputTypes(){
        let inputType: string = this.pdfNodeConfigFormGroup.get('parameterinputType').value;
        this.configuration.parameterinputType = inputType;
        if (inputType === 'RULE_INPUT'){
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.pdfNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.parameterparam= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.pdfNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterconstant= {};
            this.configuration.parameterreference= {};
            this.pdfNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'CONSTANT'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterreference= {};
            this.pdfNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        }  else if (inputType === 'REFERENCE'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    deleteErrorRow(index: number): void{
        this.configuration.errorFunctionParameters.splice(index, 1);
        this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
        this.updateModel(this.configuration);
    }

    addErrorParameter(): void{

        let errorInputType: string = this.pdfNodeConfigFormGroup.get('errorParameterinputType').value;
        let errorBranchparameter = this.pdfNodeConfigFormGroup.get('errorBranchparameter').value;

        if (errorInputType === 'RULE_INPUT'){
            let selectedErrorParameterParam = this.pdfNodeConfigFormGroup.get('errorParameterparam').value;
            let errorParameter = {
                'parameterName': errorBranchparameter.name,
                'inputType': errorInputType,
                'input': '-',
                'property': selectedErrorParameterParam.inputName
            };
            this.configuration.errorFunctionParameters.push(errorParameter);
            this.updateModel(this.configuration);
        } else if (errorInputType === 'PROPERTY'){
            let selectedErrorParameterProperty = this.pdfNodeConfigFormGroup.get('errorParameterproperty').value;
            let errorParameterproperty = {
                'parameterName': errorBranchparameter.name,
                'inputType': errorInputType,
                'input': '-',
                'property': selectedErrorParameterProperty.name
            };
            this.configuration.errorFunctionParameters.push(errorParameterproperty);
            this.updateModel(this.configuration);
        } else if (errorInputType === 'BRANCH_PARAM'){
            let selectedErrorParameterBranch = this.pdfNodeConfigFormGroup.get('errorParameterbranchparam').value;
            let errorParameterbranchparam = {
                'parameterName': errorBranchparameter.name,
                'inputType': errorInputType,
                'input': '-',
                'property': selectedErrorParameterBranch.name
            };
            this.configuration.errorFunctionParameters.push(errorParameterbranchparam);
            this.updateModel(this.configuration);
        } else if (errorInputType === 'ERROR'){
          let errString = {
            'parameterName': errorBranchparameter.name,
            'inputType': errorInputType,
            'input': '-',
            'property': ''
          };
          this.configuration.errorFunctionParameters.push(errString);
          this.updateModel(this.configuration);
        }

        this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

        this.configuration.errorParameterinputType = '';
        this.configuration.errorParameterproperty= {};
        this.configuration.errorParameterparam= {};
        this.configuration.errorBranchparameter= {};
        this.configuration.errorParameterbranchparam= {};

        this.pdfNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

    }

    deleteRow(index: number): void{
        this.configuration.pdfParameters.splice(index, 1);
        this.datasource = new MatTableDataSource(this.configuration.pdfParameters);
        this.updateModel(this.configuration);
    }

    addParameter(): void{
        let inputType: string = this.pdfNodeConfigFormGroup.get('parameterinputType').value;
        let key = this.pdfNodeConfigFormGroup.get('key').value;

        if (inputType === 'RULE_INPUT'){
            let selectedParameterParam = this.pdfNodeConfigFormGroup.get('parameterparam').value;
            let parameter = {
                'key': key,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterParam.inputName
            };
            this.configuration.pdfParameters.push(parameter);
            this.updateModel(this.configuration);
        } else if (inputType === 'PROPERTY'){
            let selectedParameterProperty = this.pdfNodeConfigFormGroup.get('parameterproperty').value;
            let parameterproperty = {
                'key': key,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterProperty.name
            };
            this.configuration.pdfParameters.push(parameterproperty);
            this.updateModel(this.configuration);
        } else if (inputType === 'BRANCH_PARAM'){
            let selectedParameterBranch = this.pdfNodeConfigFormGroup.get('parameterbranch').value;
            let parameterbranch = {
                'key': key,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterBranch.name
            };
            this.configuration.pdfParameters.push(parameterbranch);
            this.updateModel(this.configuration);
        } else if (inputType === 'CONSTANT'){
            let selectedParameterConstant = this.pdfNodeConfigFormGroup.get('parameterconstant').value;
            let parameterconstant = {
                'key': key,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterConstant.constantName
            };
            this.configuration.pdfParameters.push(parameterconstant);
            this.updateModel(this.configuration);
        } else if (inputType === 'REFERENCE'){
            let selectedParameterReference = this.pdfNodeConfigFormGroup.get('parameterreference').value;
            let parameterreference = {
                'key': key,
                'inputType': inputType,
                'input': '-',
                'property': selectedParameterReference.modelproperty.data.path
            };
            this.configuration.pdfParameters.push(parameterreference);
            this.updateModel(this.configuration);
        }

        this.datasource = new MatTableDataSource(this.configuration.pdfParameters);

        this.configuration.parameterinputType = '';
        this.configuration.parameterproperty= {};
        this.configuration.parameterbranch= {};
        this.configuration.parameterparam= {};
        this.configuration.parameterconstant= {};
        this.configuration.parameterreference= {};
        this.configuration.key= {};

        this.pdfNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterreference').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('key').patchValue([], {emitEvent: false});

    }

    writeValue(value: RuleNodeConfiguration): void {

        this.configuration = deepClone(value);
        if(this.configuration.pdfParameters === null || this.configuration.pdfParameters === undefined){
            this.configuration.pdfParameters = [];
        }
        this.datasource = new MatTableDataSource(this.configuration.pdfParameters);
        if (this.changeSubscription) {
            this.changeSubscription.unsubscribe();
            this.changeSubscription = null;
        }

        if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
            this.configuration.errorFunctionParameters = [];
        }
        this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

        if (this.definedConfigComponent) {
            this.definedConfigComponent.configuration = this.configuration;
            this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
                this.updateModel(configuration);
            });
        } else {

            let tempObj = this.configuration.pdf;
            if(tempObj && this.allPdfs){
                tempObj = this.allPdfs.find(x => x.name === this.configuration.pdf.name );
            }

            let assignedProperty = this.configuration.assignedProperty;
            if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
                assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
            }

            let errorBranch = this.configuration.errorBranch;
            if(errorBranch && this.allSubRules){
                errorBranch = this.allSubRules.find(x => x.name === this.configuration.errorBranch.name );
            }

            let assignedReference = this.configuration.assignedReference;
            if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
                assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
            }
            this.pdfNodeConfigFormGroup.patchValue({
                inputType: this.configuration.inputType,
                key: this.configuration.key,
                //record: this.configuration.record,
                //customObject: customObject,
                parameterinputType: this.configuration.parameterinputType,
                parameterparam: this.configuration.parameterparam,
                parameterproperty: this.configuration.parameterproperty,
                parameterconstant: this.configuration.parameterconstant,
                parameterbranch: this.configuration.parameterbranch,
                parameterreference: this.configuration.parameterreference,
                pdf: tempObj,
                assignedProperty: assignedProperty,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                assignedtoinputType: this.configuration.assignedtoinputType,
                assignedReference: assignedReference,
                errorBranch: errorBranch,
                errorInputType: this.configuration.errorInputType,
                errorBranchparameter: this.configuration.errorBranchparameter,
                errorParameterinputType: this.configuration.errorParameterinputType,
                errorParameterparam: this.configuration.errorParameterparam,
                errorParameterproperty: this.configuration.errorParameterproperty,
                errorParameterbranchparam: this.configuration.errorParameterbranchparam,
                errorIsAsync: this.configuration.errorIsAsync,
                isReturn: this.configuration.isReturn
            });

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('isReturn').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.isReturn = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorIsAsync = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorBranch = configuration;

                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorParameterparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorParameterbranchparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorParameterproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorMsg = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorAction = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('pdf').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.pdf = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.assignedProperty = configuration;
                    this.updateModel(this.configuration);
                }
            );
            this.changeSubscription = this.pdfNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterbranch = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('parameterreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.parameterreference = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.assignedReference = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.pdfNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
                (configuration: RuleNodeConfiguration) => {

                    this.configuration.assignedtoinputType = configuration;
                    if(this.configuration.assignedtoinputType == 'PROPERTY'){
                        this.configuration.assignedReference= {};
                        this.pdfNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
                    }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
                        this.configuration.assignedProperty= {};
                        this.pdfNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
                    }
                    this.updateModel(this.configuration);
                }
            );
        }
    }
    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.pdfNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}

export interface PdfParameters {
    key: string;
    inputType: string;
    input: string;
    property: string;
}

export interface ErrorFunctionParameters {
    parameterName: string;
    inputType: string;
    input: string;
    property: string;
}