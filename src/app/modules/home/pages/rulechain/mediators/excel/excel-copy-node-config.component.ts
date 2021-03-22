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
            url: []
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


            this.excelCopyNodeConfigFormGroup.patchValue({
                sourcesheetName : this.configuration.sourcesheetName,
                newsheetName : this.configuration.newsheetName,
                errorMsg: this.configuration.errorMsg,
                errorAction: this.configuration.errorAction,
                propertyinputType: this.configuration.propertyinputType,
                propertyproperty: propertyproperty,
                propertyreference: propertyreference,
                excelFileInputType: this.configuration.propertyinputType,
                url: this.configuration.propertyinputType
            });

            this.changeSubscription = this.excelCopyNodeConfigFormGroup.get('excelFileInputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.excelFileInputType = configuration;
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

