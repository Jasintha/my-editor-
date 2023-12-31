///
///
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

import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FcRuleNode, RuleNodeType } from '@shared/models/rule-node.models';
import { EntityType } from '@shared/models/entity-type.models';
import { Subscription } from 'rxjs';
import { QuestionBase } from '@shared/models/question-base.models';
import { RuleChainService } from '@core/http/rule-chain.service';
import { RuleNodeConfigComponent } from './rule-node-config.component';
import {ConOperationBase} from "@shared/models/ConnectorOperation.models";
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'virtuan-rule-node',
  templateUrl: './rule-node-details.component.html',
  styleUrls: ['./rule-node-details.component.scss']
})
export class RuleNodeDetailsComponent extends PageComponent implements OnInit, OnChanges {

  @ViewChild('ruleNodeConfigComponent') ruleNodeConfigComponent: RuleNodeConfigComponent;

  @Input()
  ruleNode: FcRuleNode;

  @Input()
  ruleChainId: string;

  @Input()
  inputEntities: any[];

  @Input()
  ruleEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allFields: any[];

  @Input()
  allConstants: any[];

  @Input()
  allVariables: any[];

  @Input()
  allSavedObjects: any[];

  @Input()
  isEdit: boolean;

  @Input()
  isNodeEdit: boolean;

  @Input()
  isDesignNode: boolean;

  @Input()
  allDomainModels: any[];

  @Input()
  allValueObjectProperties: any[];

  @Input()
  allRuleInputs: any[];

  @Input()
  allViewModels: any[];

  @Input()
  allLambdaFunctions: any[];

  @Input()
  allPdfs: any[];

  @Input()
  allHybridFunctions: any[];

  @Input()
  connectionPropertyTemplates: any[];

  @Input()
  allSubRules: any[];

  @Input()
  allApis: any[];

  @Input()
  allDomainModelsWithSub: any[];

  @Input()
  allViewModelsWithSub: any[];

  @Input()
  allRoots: any[];

  @Input()
  allErrorBranches: any[];

  @Input()
  allModelProperties: any[];

  @Input()
  allConnectionProperties: any[];

  allReferenceProperties: any[];

  @Input()
  allEvents: any[];

  @Input()
  queryDb: string;

  @Input()
  commandDb: string;

  @Input()
  apptype: string;

  @Input()
  isReadOnly: boolean;

  @Input()
  allMicroservices: any[];

  @Input() connectorfields: QuestionBase[];

  @Input() connectorOperations: ConOperationBase[];

  @Input() branchAvailability: any;

  @Input()
  projectUid: string;

  @Input()
  storyuuid: string;

  @Input()
  serviceUuid: string;

  ruleNodeType = RuleNodeType;
  entityType = EntityType;

  ruleNodeFormGroup: FormGroup;

  private ruleNodeFormSubscription: Subscription;

  constructor(protected store: Store<AppState>,
              private fb: FormBuilder,
              private ruleChainService: RuleChainService) {
    super(store);
    this.ruleNodeFormGroup = this.fb.group({});
  }

  private buildForm() {
    if (this.ruleNodeFormSubscription) {
      this.ruleNodeFormSubscription.unsubscribe();
      this.ruleNodeFormSubscription = null;
    }
    if (this.ruleNode) {
      if (this.ruleNode.component.type !== RuleNodeType.RULE_CHAIN) {
        this.ruleNodeFormGroup = this.fb.group({
          name: [this.ruleNode.name, [Validators.required]],
          //debugMode: [this.ruleNode.debugMode, []],
          configuration: [this.ruleNode.configuration, [Validators.required]],
          additionalInfo: this.fb.group(
            {
              description: [this.ruleNode.additionalInfo ? this.ruleNode.additionalInfo.description : ''],
            }
          )
        });
      } else {
        this.ruleNodeFormGroup = this.fb.group({
          targetRuleChainId: [this.ruleNode.targetRuleChainId, [Validators.required]],
          additionalInfo: this.fb.group(
            {
              description: [this.ruleNode.additionalInfo ? this.ruleNode.additionalInfo.description : ''],
            }
          )
        });
      }
      this.ruleNodeFormSubscription = this.ruleNodeFormGroup.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.updateRuleNode();
      });
    } else {
      this.ruleNodeFormGroup = this.fb.group({});
    }
  }

  private updateRuleNode() {
    const formValue = this.ruleNodeFormGroup.value || {};
    if (this.ruleNode.component.type === RuleNodeType.RULE_CHAIN) {
      const targetRuleChainId: string = formValue.targetRuleChainId;
      if (this.ruleNode.targetRuleChainId !== targetRuleChainId && targetRuleChainId) {
        this.ruleChainService.getRuleChain(targetRuleChainId).subscribe(
          (ruleChain) => {
            this.ruleNode.name = ruleChain.name;
            Object.assign(this.ruleNode, formValue);
          }
        );
      } else {
        Object.assign(this.ruleNode, formValue);
      }
    } else {
      Object.assign(this.ruleNode, formValue);
    }
  }

  ngOnInit(): void {
    if(this.branchAvailability.branchFound){
        this.allModelProperties = this.branchAvailability.properties;
        this.allConstants = this.branchAvailability.constants;
        this.allVariables = this.branchAvailability.variables;
        this.allValueObjectProperties= this.branchAvailability.valueObjectProperties;
        this.allConnectionProperties = this.branchAvailability.connectionProperties;
    } else {
        this.allModelProperties = this.branchAvailability.properties;
        this.allConstants = this.branchAvailability.constants;
        this.allVariables = this.branchAvailability.variables;
        this.allValueObjectProperties= this.branchAvailability.valueObjectProperties;
        this.allConnectionProperties = this.branchAvailability.connectionProperties;
    }

    if(this.branchAvailability.apiFoundObj && this.branchAvailability.apiFoundObj.apiNodeFound){
      this.allRuleInputs = this.branchAvailability.apiFoundObj.nodeRuleInputs;
    }

    this.allReferenceProperties = this.branchAvailability.referenceProperties;
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName of Object.keys(changes)) {
      const change = changes[propName];
      if (change.currentValue !== change.previousValue) {
        if (propName === 'ruleNode') {
          this.buildForm();
        }
      }
    }
  }

  validate() {
    if (this.ruleNode.component.type !== RuleNodeType.RULE_CHAIN) {
      this.ruleNodeConfigComponent.validate();
    }
  }
}
