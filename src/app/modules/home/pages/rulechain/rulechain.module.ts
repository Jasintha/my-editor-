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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { RuleChainRoutingModule } from '@modules/home/pages/rulechain/rulechain-routing.module';
import { MediatorNodeConfigModule } from '@modules/home/pages/rulechain/mediators/mediator-node-config.module';
import { HomeComponentsModule } from '@modules/home/components/home-components.module';
import {
  AddRuleNodeDialogComponent,
  AddRuleNodeLinkDialogComponent,
  RuleChainPageComponent
} from './rulechain-page.component';
import { MainRuleChainComponent } from '@home/pages/rulechain/main-rulechain.component';
import { AngularSplitModule } from 'angular-split';
import { RuleNodeComponent } from '@home/pages/rulechain/rulenode.component';
import { FC_NODE_COMPONENT_CONFIG } from 'ngx-flowchart/dist/ngx-flowchart';
import { RuleNodeDetailsComponent } from './rule-node-details.component';
import { RuleNodeLinkComponent } from './rule-node-link.component';
import { LinkLabelsComponent } from '@home/pages/rulechain/link-labels.component';
import { RuleNodeConfigComponent } from './rule-node-config.component';
import { MatTreeModule } from '@angular/material/tree';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';

import {CreateApiModule} from '@home/pages/create-api/create-api.module';
import {CreateSubruleModule} from '@home/pages/create-subrule/create-subrule.module';
import {CreateModelModule} from '@home/pages/create-model/create-model.module';
import {CreateEventModule} from '@home/pages/create-event/create-event.module';
import {CreateHybridfunctionModule} from '@home/pages/create-hybridfunction/create-hybridfunction.module';
import {CreateLamdafunctionModule} from '@home/pages/create-lamdafunction/create-lamdafunction.module';
import {CreateTaskModule} from '@home/pages/create-task/create-task.module';

@NgModule({
  declarations: [
    RuleChainPageComponent,
    MainRuleChainComponent,
    RuleNodeComponent,
    RuleNodeDetailsComponent,
    RuleNodeConfigComponent,
    LinkLabelsComponent,
    RuleNodeLinkComponent,
    AddRuleNodeLinkDialogComponent,
    AddRuleNodeDialogComponent
  ],
  providers: [
    {
      provide: FC_NODE_COMPONENT_CONFIG,
      useValue: {
        nodeComponentType: RuleNodeComponent
      }
    }
  ],
  imports: [
    CommonModule,
    SharedModule,
    HomeComponentsModule,
    RuleChainRoutingModule,
    MediatorNodeConfigModule,
    AngularSplitModule,
    MatTreeModule,
    MatSidenavModule,
    MatButtonModule,
    MatDialogModule,
    CreateApiModule,
    CreateSubruleModule,
    CreateModelModule,
    MatToolbarModule,
    MatDividerModule,
    CreateEventModule,
    CreateHybridfunctionModule,
    CreateLamdafunctionModule,
    CreateTaskModule
  ]
})
export class RuleChainModule { }
