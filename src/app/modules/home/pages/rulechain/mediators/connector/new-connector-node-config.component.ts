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
import {ConOperationBase} from "@shared/models/ConnectorOperation.models";

@Component({
    selector: 'virtuan-new-connector-node-config',
    templateUrl: './new-connector-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => NewConnectorNodeConfigComponent),
        multi: true
    }]
})
export class NewConnectorNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
    inputEntities: any[];

    @Input()
    allVariables: any[];

    @Input()
    inputProperties: any[];

    @Input()
    allConstants: any[];

    @Input()
    operations: ConOperationBase[];

    @Input()
    inputCustomobjects: any[];

    @Input()
    allModelProperties: any[];

    @Input()
    apptype: string;

    @Input()
    allRoots: any[];

    @Input()
    allRuleInputs: any[];

    @Input() branchAvailability: any;

    allOperations: string[];

    @Input()
    disabled: boolean;

    @Input()
    ruleNodeId: string;

    @Input()
    allReferenceProperties: any[];

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

    newConnectorConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.newConnectorConfigFormGroup = this.fb.group({
            operation: [],
            reqModel: [],
            resModel: []
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    ngOnInit(): void {
        this.allOperations = [];
        if (this.operations){
            this.operations.forEach(op =>
                this.allOperations.push(op.opName)
            )
        }
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
            this.newConnectorConfigFormGroup.disable({emitEvent: false});
        } else {
            this.newConnectorConfigFormGroup.enable({emitEvent: false});
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

            let reqModel = this.configuration.reqModel;
            if(this.configuration.reqModel){
                reqModel = this.allModelProperties.find(x => x.name === this.configuration.reqModel.name );
            }

            let resModel = this.configuration.resModel;
            if(this.configuration.resModel){
                resModel = this.allModelProperties.find(x => x.name === this.configuration.resModel.name );
            }

            this.newConnectorConfigFormGroup.patchValue({
                operation: this.configuration.operation,
                reqModel: reqModel,
                resModel: resModel
            });

            this.changeSubscription = this.newConnectorConfigFormGroup.get('operation').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.operation = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.newConnectorConfigFormGroup.get('reqModel').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.reqModel = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.newConnectorConfigFormGroup.get('resModel').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.resModel = configuration;
                    this.updateModel(this.configuration);
                }
            );

        }
    }

    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.newConnectorConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}
