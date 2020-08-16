///
/// Copyright © 2016-2020 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import {
  AfterViewInit,
  Component,
  ComponentRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition,
} from '@shared/models/rule-node.models';
import { QuestionBase } from '@shared/models/question-base.models';
import { Subscription } from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { TranslateService } from '@ngx-translate/core';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';
import { deepClone } from '@core/utils';

@Component({
  selector: 'tb-mediator-node-config',
  templateUrl: './mediator-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MediatorNodeConfigComponent),
    multi: true
  }]
})
export class MediatorNodeConfigComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  ruleNodeId: string;

  @Input()
  nodeClazz: string;

  @Input()
  inputEntities: any[];

  @Input()
  ruleEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  inputProperties: any[];

  @Input()
  ruleType: string;

  @Input()
  allFields: any[];

  @Input()
  allConstants: any[];

  @Input()
  allSavedObjects: any[];

  @Input()
  allVariables: any[];

  @Input() connectorfields: QuestionBase[];

  nodeDefinitionValue: RuleNodeDefinition;

  @Input()
  set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
    if (this.nodeDefinitionValue !== nodeDefinition) {
      this.nodeDefinitionValue = nodeDefinition;

      if (this.nodeDefinitionValue) {
        //this.validateDefinedDirective();
      }
    }
  }

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  //definedDirectiveError: string;

  mediatorNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  //private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  private configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.mediatorNodeConfigFormGroup = this.fb.group({
      configuration: [null, Validators.required]
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
  /*
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
    */
  }

  ngAfterViewInit(): void {
  }

/*
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.mediatorNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.mediatorNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  */

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
      this.mediatorNodeConfigFormGroup.get('configuration').patchValue(this.configuration, {emitEvent: false});
      this.changeSubscription = this.mediatorNodeConfigFormGroup.get('configuration').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.updateModel(configuration);
        }
      );
    }
  }

/*

  useDefinedDirective(): boolean {
    return this.nodeDefinition &&
      (this.nodeDefinition.configDirective &&
       this.nodeDefinition.configDirective.length) && !this.definedDirectiveError;
  }
*/
  private updateModel(configuration: RuleNodeConfiguration) {

  let required :boolean = true;
    if (this.definedConfigComponent || this.mediatorNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(required ? null : configuration);
    }
  }

/*
  private validateDefinedDirective() {



    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
      this.definedConfigComponentRef = null;
    }
    if (this.nodeDefinition.uiResourceLoadError && this.nodeDefinition.uiResourceLoadError.length) {
      this.definedDirectiveError = this.nodeDefinition.uiResourceLoadError;
    } else if (this.nodeDefinition.configDirective && this.nodeDefinition.configDirective.length) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
        this.changeSubscription = null;
      }
      this.definedConfigContainer.clear();
      const factory = this.ruleChainService.getRuleNodeConfigFactory(this.nodeDefinition.configDirective);
      this.definedConfigComponentRef = this.definedConfigContainer.createComponent(factory);
      this.definedConfigComponent = this.definedConfigComponentRef.instance;
      this.definedConfigComponent.ruleNodeId = this.ruleNodeId;
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    }
  }

  validate() {
    if (this.useDefinedDirective()) {
      this.definedConfigComponent.validate();
    }
  }

  */
}
