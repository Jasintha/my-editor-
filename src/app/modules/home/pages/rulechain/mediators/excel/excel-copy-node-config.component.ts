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
    selector: 'virtuan-excelCopy-node-config',
    templateUrl: './excel-copy-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ExcelCopyNodeConfigComponent),
        multi: true
    }]
})
export class ExcelCopyNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

    excelCopyNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    errordatasource: MatTableDataSource<ErrorFunctionParameters>;
    displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.excelCopyNodeConfigFormGroup = this.fb.group({
            sourcesheetName : "",
            newsheetName : "",
            errorMsg: "",
            errorAction: "",
            propertyinputType: "",
            propertyproperty: [],
            propertyreference: [],
            excelFileInputType: [],
            url: [],
            errorBranch: [],
            errorInputType: [],
            errorIsAsync: false,
            errorBranchparameter: [],
            errorParameterinputType: [],
            errorParameterparam: [],
            errorParameterproperty: [],
            errorParameterbranchparam: []
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

    refreshErrorParameterInputTypes(){
        let errorInputType: string = this.excelCopyNodeConfigFormGroup.get('errorParameterinputType').value;
        this.configuration.errorParameterinputType = errorInputType;
        if (errorInputType === 'RULE_INPUT'){
            this.configuration.errorParameterproperty= {};
            this.configuration.errorParameterbranchparam= {};
            this.excelCopyNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
            this.excelCopyNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
        } else if (errorInputType === 'PROPERTY'){
            this.configuration.errorParameterparam= {};
            this.configuration.errorParameterbranchparam= {};
            this.excelCopyNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
            this.excelCopyNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
        } else if (errorInputType === 'BRANCH_PARAM'){
            this.configuration.errorParameterparam= {};
            this.configuration.errorParameterproperty= {};
            this.excelCopyNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
            this.excelCopyNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    refreshInputTypes(){
        let inputType: string = this.excelCopyNodeConfigFormGroup.get('propertyinputType').value;
        this.configuration.propertyinputType = inputType;

        if (inputType === 'PROPERTY'){
            this.configuration.propertyreference= {};
            this.excelCopyNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
        } else if (inputType === 'REFERENCE'){
            this.configuration.propertyproperty= {};
            this.excelCopyNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }


    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.excelCopyNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.excelCopyNodeConfigFormGroup.enable({emitEvent: false});
        }
    }

    deleteErrorRow(index: number): void{
        this.configuration.errorFunctionParameters.splice(index, 1);
        this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
        this.updateModel(this.configuration);
    }

    addErrorParameter(): void{

        let errorInputType: string = this.excelCopyNodeConfigFormGroup.get('errorParameterinputType').value;
        let errorBranchparameter = this.excelCopyNodeConfigFormGroup.get('errorBranchparameter').value;

        if (errorInputType === 'RULE_INPUT'){
            let selectedErrorParameterParam = this.excelCopyNodeConfigFormGroup.get('errorParameterparam').value;
            let errorParameter = {
                'parameterName': errorBranchparameter.name,
                'inputType': errorInputType,
                'input': '-',
                'property': selectedErrorParameterParam.inputName
            };
            this.configuration.errorFunctionParameters.push(errorParameter);
            this.updateModel(this.configuration);
        } else if (errorInputType === 'PROPERTY'){
            let selectedErrorParameterProperty = this.excelCopyNodeConfigFormGroup.get('errorParameterproperty').value;
            let errorParameterproperty = {
                'parameterName': errorBranchparameter.name,
                'inputType': errorInputType,
                'input': '-',
                'property': selectedErrorParameterProperty.name
            };
            this.configuration.errorFunctionParameters.push(errorParameterproperty);
            this.updateModel(this.configuration);
        } else if (errorInputType === 'BRANCH_PARAM'){
            let selectedErrorParameterBranch = this.excelCopyNodeConfigFormGroup.get('errorParameterbranchparam').value;
            let errorParameterbranchparam = {
                'parameterName': errorBranchparameter.name,
                'inputType': errorInputType,
                'input': '-',
                'property': selectedErrorParameterBranch.name
            };
            this.configuration.errorFunctionParameters.push(errorParameterbranchparam);
            this.updateModel(this.configuration);
        }

        this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

        this.configuration.errorParameterinputType = '';
        this.configuration.errorParameterproperty= {};
        this.configuration.errorParameterparam= {};
        this.configuration.errorBranchparameter= {};
        this.configuration.errorParameterbranchparam= {};

        this.excelCopyNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
        this.excelCopyNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
        this.excelCopyNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
        this.excelCopyNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
        this.excelCopyNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

    }


    writeValue(value: RuleNodeConfiguration): void {

        this.configuration = deepClone(value);

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

            let propertyproperty = this.configuration.propertyproperty;
            if(this.configuration.propertyinputType === 'PROPERTY' && this.allModelProperties){
                propertyproperty = this.allModelProperties.find(x => x.name === this.configuration.propertyproperty.name );
            }

            let errorBranch = this.configuration.errorBranch;
            if(errorBranch && this.allRoots){
                errorBranch = this.allRoots.find(x => x.name === this.configuration.errorBranch.name );
            }

            let propertyreference = this.configuration.propertyreference;
            if(this.configuration.propertyinputType === 'REFERENCE' && this.allReferenceProperties){
                propertyreference = this.allModelProperties.find(x => x.name === this.configuration.propertyreference.name );
            }


            this.excelCopyNodeConfigFormGroup.patchValue({
                sourcesheetName : this.configuration.sourcesheetName,
                newsheetName : this.configuration.newsheetName,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                propertyinputType: this.configuration.propertyinputType,
                propertyproperty: propertyproperty,
                propertyreference: propertyreference,
                excelFileInputType: this.configuration.propertyinputType,
                url: this.configuration.propertyinputType,
                errorBranch: errorBranch,
                errorInputType: this.configuration.errorInputType,
                errorBranchparameter: this.configuration.errorBranchparameter,
                errorParameterinputType: this.configuration.errorParameterinputType,
                errorParameterparam: this.configuration.errorParameterparam,
                errorParameterproperty: this.configuration.errorParameterproperty,
                errorParameterbranchparam: this.configuration.errorParameterbranchparam,
                errorIsAsync: this.configuration.errorIsAsync
            });

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorIsAsync = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorBranch = configuration;

                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorParameterparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorParameterbranchparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorParameterproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('excelFileInputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelFileInputType = configuration;

                    if(this.configuration.excelFileInputType == 'FILE_UPLOAD'){
                        this.configuration.url= "";
                        this.excelCopyNodeConfigFormGroup.get('url').patchValue("", {emitEvent: false});
                    }else if (this.configuration.excelFileInputType == 'REMOTE_PATH'){
                        this.configuration.propertyinputType= "";
                        this.excelCopyNodeConfigFormGroup.get('propertyinputType').patchValue("", {emitEvent: false});
                    }

                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('url').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.url = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('sourcesheetName').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.sourcesheetName = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('newsheetName').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.newsheetName = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorMsg = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorAction = configuration;
                    this.updateModel(this.configuration);
                }
            );


            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('propertyinputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyinputType = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyreference = configuration;
                    this.updateModel(this.configuration);
                }
            );
        }
    }
    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.excelCopyNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}

export interface ErrorFunctionParameters {
    parameterName: string;
    inputType: string;
    input: string;
    property: string;
}

