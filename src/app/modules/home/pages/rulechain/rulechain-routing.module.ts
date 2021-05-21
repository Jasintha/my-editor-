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

import * as AngularCore from '@angular/core';
import { Injectable, NgModule } from '@angular/core';
import * as AngularRouter from '@angular/router';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Resolve,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes,
  UrlTree
} from '@angular/router';

import { Authority } from '@shared/models/authority.enum';
import * as RxJs from 'rxjs';
import { Observable } from 'rxjs';
import * as RxJsOperators from 'rxjs/operators';
import { BreadCrumbConfig, BreadCrumbLabelFunction } from '@shared/components/breadcrumb';
import { ResolvedRuleChainMetaData, RuleChain, ConnectionPropertyTemplate } from '@shared/models/rule-chain.models';
import { RuleChainService } from '@core/http/rule-chain.service';
import { RuleChainPageComponent } from '@home/pages/rulechain/rulechain-page.component';
import { RuleNodeComponentDescriptor } from '@shared/models/rule-node.models';
import { ConfirmOnExitGuard } from '@core/guards/confirm-on-exit.guard';

import * as AngularCommon from '@angular/common';
import * as AngularForms from '@angular/forms';
import * as AngularCdkCoercion from '@angular/cdk/coercion';
import * as AngularCdkKeycodes from '@angular/cdk/keycodes';
import * as AngularMaterialChips from '@angular/material/chips';
import * as AngularMaterialAutocomplete from '@angular/material/autocomplete';
import * as AngularMaterialDialog from '@angular/material/dialog';
import * as NgrxStore from '@ngrx/store';
import * as TranslateCore from '@ngx-translate/core';
import * as VirtuanCore from '@core/public-api';
import { ItemBufferService } from '@core/public-api';
import * as VirtuanShared from '@shared/public-api';
import * as VirtuanHomeComponents from '@home/components/public-api';
import * as _moment from 'moment';

declare const SystemJS;

const ruleNodeConfigResourcesModulesMap = {
  '@angular/core': SystemJS.newModule(AngularCore),
  '@angular/common': SystemJS.newModule(AngularCommon),
  '@angular/forms': SystemJS.newModule(AngularForms),
  '@angular/router': SystemJS.newModule(AngularRouter),
  '@angular/cdk/keycodes': SystemJS.newModule(AngularCdkKeycodes),
  '@angular/cdk/coercion': SystemJS.newModule(AngularCdkCoercion),
  '@angular/material/chips': SystemJS.newModule(AngularMaterialChips),
  '@angular/material/autocomplete': SystemJS.newModule(AngularMaterialAutocomplete),
  '@angular/material/dialog': SystemJS.newModule(AngularMaterialDialog),
  '@ngrx/store': SystemJS.newModule(NgrxStore),
  rxjs: SystemJS.newModule(RxJs),
  'rxjs/operators': SystemJS.newModule(RxJsOperators),
  '@ngx-translate/core': SystemJS.newModule(TranslateCore),
  '@core/public-api': SystemJS.newModule(VirtuanCore),
  '@shared/public-api': SystemJS.newModule(VirtuanShared),
  '@home/components/public-api': SystemJS.newModule(VirtuanHomeComponents),
  moment: SystemJS.newModule(_moment)
};

@Injectable()
export class RuleChainResolver implements Resolve<RuleChain> {

  constructor(private ruleChainService: RuleChainService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<RuleChain> {
    const ruleChainId = route.params.ruleChainId;
    const username = route.params.username;
    const uid = route.params.uid;
    return this.ruleChainService.getRuleChainWithUsernameAndUID(ruleChainId,username,uid);
  }
}

@Injectable()
export class ConnectionPropertyTemplateResolver implements Resolve<ConnectionPropertyTemplate[]> {

  constructor(private ruleChainService: RuleChainService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<ConnectionPropertyTemplate[]> {
    return this.ruleChainService.getConnectionPropertyTemplates();
  }
}


@Injectable()
export class ResolvedRuleChainMetaDataResolver implements Resolve<ResolvedRuleChainMetaData> {

  constructor(private ruleChainService: RuleChainService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<ResolvedRuleChainMetaData> {
    const ruleChainId = route.params.ruleChainId;
    const username = route.params.username;
    const uid = route.params.uid;
    return this.ruleChainService.getResolvedRuleChainMetadata(ruleChainId, username, uid);
  }
}

@Injectable()
export class RuleNodeComponentsResolver implements Resolve<Array<RuleNodeComponentDescriptor>> {

  constructor(private ruleChainService: RuleChainService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Array<RuleNodeComponentDescriptor>> {
    const editorType = route.params.editorType;
    return this.ruleChainService.getRuleNodeComponents(ruleNodeConfigResourcesModulesMap, editorType);
  }
}

@Injectable()
export class RuleChainImportGuard implements CanActivate {

  constructor(private itembuffer: ItemBufferService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.itembuffer.hasRuleChainImport()) {
      return true;
    } else {
      return this.router.parseUrl('ruleChains');
    }
  }

}

export const ruleChainBreadcumbLabelFunction: BreadCrumbLabelFunction<RuleChainPageComponent>
  = ((route, translate, component) => {
  let label: string = component.ruleChain.name;
  if (component.ruleChain.root) {
    label += ` (${translate.instant('rulechain.root')})`;
  }
  return label;
});

export const importRuleChainBreadcumbLabelFunction: BreadCrumbLabelFunction<RuleChainPageComponent> =
  ((route, translate, component) => {
  return `${translate.instant('rulechain.import')}: ${component.ruleChain.name}`;
});

const routes: Routes = [
  {
    path: 'ruleChains',
    data: {
      breadcrumb: {
        label: 'rulechain.rulechains',
        icon: 'settings_ethernet'
      }
    },
    children: [
      {
        path: ':ruleChainId/:editorType/:username/:uid',
        component: RuleChainPageComponent,
        canDeactivate: [ConfirmOnExitGuard],
        data: {
          breadcrumb: {
            labelFunction: ruleChainBreadcumbLabelFunction,
            icon: 'settings_ethernet'
          } as BreadCrumbConfig<RuleChainPageComponent>,
          auth: [Authority.TENANT_ADMIN],
          title: 'rulechain.rulechain',
          import: false
        },
        resolve: {
          ruleChain: RuleChainResolver,
          connectionPropertyTemplates: ConnectionPropertyTemplateResolver,
          ruleChainMetaData: ResolvedRuleChainMetaDataResolver,
          ruleNodeComponents: RuleNodeComponentsResolver
        }
      }
    ]
  }
];

// @dynamic
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    RuleChainResolver,
    ResolvedRuleChainMetaDataResolver,
    ConnectionPropertyTemplateResolver,
    RuleNodeComponentsResolver,
    RuleChainImportGuard
  ]
})
export class RuleChainRoutingModule { }
