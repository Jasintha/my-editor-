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
    selector: 'virtuan-excelDelete-node-config',
    templateUrl: './excel-delete-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ExcelDeleteNodeConfigComponent),
        multi: true
    }]
})
export class ExcelDeleteNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

    excelDeleteNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.excelDeleteNodeConfigFormGroup = this.fb.group({
            sourcesheetName : "",
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
    }

    ngOnDestroy(): void {
        if (this.definedConfigComponentRef) {
            this.definedConfigComponentRef.destroy();
        }
    }

    ngAfterViewInit(): void {
    }

    refreshInputTypes(){
        let inputType: string = this.excelDeleteNodeConfigFormGroup.get('propertyinputType').value;
        this.configuration.propertyinputType = inputType;

        if (inputType === 'PROPERTY'){
            this.configuration.propertyreference= {};
            this.excelDeleteNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
        } else if (inputType === 'REFERENCE'){
            this.configuration.propertyproperty= {};
            this.excelDeleteNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }


    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.excelDeleteNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.excelDeleteNodeConfigFormGroup.enable({emitEvent: false});
        }
    }


    writeValue(value: RuleNodeConfiguration): void {

        this.configuration = deepClone(value);

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

            let propertyproperty = this.configuration.propertyproperty;
            if(this.configuration.propertyinputType === 'PROPERTY' && this.allModelProperties){
                propertyproperty = this.allModelProperties.find(x => x.name === this.configuration.propertyproperty.name );
            }

            let propertyreference = this.configuration.propertyreference;
            if(this.configuration.propertyinputType === 'REFERENCE' && this.allReferenceProperties){
                propertyreference = this.allModelProperties.find(x => x.name === this.configuration.propertyreference.name );
            }


            this.excelDeleteNodeConfigFormGroup.patchValue({
                sourcesheetName : this.configuration.sourcesheetName,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                propertyinputType: this.configuration.propertyinputType,
                propertyproperty: propertyproperty,
                propertyreference: propertyreference,
            });

            this.changeSubscription = this.excelDeleteNodeConfigFormGroup.get('sourcesheetName').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.sourcesheetName = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelDeleteNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorMsg = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelDeleteNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.errorAction = configuration;
                    this.updateModel(this.configuration);
                }
            );


            this.changeSubscription = this.excelDeleteNodeConfigFormGroup.get('propertyinputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyinputType = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelDeleteNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.excelDeleteNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyreference = configuration;
                    this.updateModel(this.configuration);
                }
            );
        }
    }
    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.excelDeleteNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}
