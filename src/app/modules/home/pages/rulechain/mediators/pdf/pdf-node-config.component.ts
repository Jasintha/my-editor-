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
    selector: 'tb-pdf-node-config',
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
    }

    ngOnDestroy(): void {
        if (this.definedConfigComponentRef) {
            this.definedConfigComponentRef.destroy();
        }
    }

    ngAfterViewInit(): void {
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.pdfNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.pdfNodeConfigFormGroup.enable({emitEvent: false});
        }
    }

    refreshParameterInputTypes(){
        let inputType: string = this.pdfNodeConfigFormGroup.get('parameterinputType').value;
        this.configuration.parameterinputType = inputType;
        if (inputType === 'RULE_INPUT'){
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.parameterparam= {};
            this.configuration.parameterbranch= {};
            this.configuration.parameterconstant= {};
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterconstant= {};
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
        } else if (inputType === 'CONSTANT'){
            this.configuration.parameterparam= {};
            this.configuration.parameterproperty= {};
            this.configuration.parameterbranch= {};
            this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
            this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

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
        }

        this.datasource = new MatTableDataSource(this.configuration.pdfParameters);

        this.configuration.parameterinputType = '';
        this.configuration.parameterproperty= {};
        this.configuration.parameterbranch= {};
        this.configuration.parameterparam= {};
        this.configuration.parameterconstant= {};
        this.configuration.key= {};

        this.pdfNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
        this.pdfNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
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
                pdf: tempObj,
                assignedProperty: assignedProperty,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                assignedtoinputType: this.configuration.assignedtoinputType,
                assignedReference: assignedReference
            });

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

