import * as AngularCore from "@angular/core";
import { Injectable, NgModule } from "@angular/core";
import * as AngularRouter from "@angular/router";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Resolve,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes,
  UrlTree,
} from "@angular/router";

import { Authority } from "@shared/models/authority.enum";
import * as RxJs from "rxjs";
import { Observable } from "rxjs";
import * as RxJsOperators from "rxjs/operators";
import {
  BreadCrumbConfig,
  BreadCrumbLabelFunction,
} from "@shared/components/breadcrumb";
import {
  ResolvedRuleChainMetaData,
  RuleChain,
  ConnectionPropertyTemplate,
} from "@shared/models/rule-chain.models";
import { RuleChainService } from "@core/http/rule-chain.service";
import { RuleChainPageComponent } from "@home/pages/rulechain/rulechain-page.component";
import { RuleNodeComponentDescriptor } from "@shared/models/rule-node.models";
import { ConfirmOnExitGuard } from "@core/guards/confirm-on-exit.guard";

import * as AngularCommon from "@angular/common";
import * as AngularForms from "@angular/forms";
import * as AngularCdkCoercion from "@angular/cdk/coercion";
import * as AngularCdkKeycodes from "@angular/cdk/keycodes";
import * as AngularMaterialChips from "@angular/material/chips";
import * as AngularMaterialAutocomplete from "@angular/material/autocomplete";
import * as AngularMaterialDialog from "@angular/material/dialog";
import * as NgrxStore from "@ngrx/store";
import * as TranslateCore from "@ngx-translate/core";
import * as VirtuanCore from "@core/public-api";
import { ItemBufferService } from "@core/public-api";
import * as VirtuanShared from "@shared/public-api";
import * as VirtuanHomeComponents from "@home/components/public-api";
import * as _moment from "moment";
import { BuildViewComponent } from "../build-view/build-view.component";
import { UiHomeComponent } from "../ui-home/ui-home.component";
import { ServiceHomeComponent } from "../service-home/service-home.component";
import { MicroserviceModelComponent } from "../aggregate/microservice-model.component";
import { ThemeUpdateComponent } from "../theme/theme-update.component";
import { LamdafunctionEditorComponent } from "../create-lamdafunction/function-editor.component";
import { DesignViewComponent } from "../design-view/design-view.component";
import { UibDashboardPageComponent } from "../uib/uib-dashboard/uib-dashboard.component";
import { UibApplicationPageComponent } from "../uib/uib-application/uib-application.component";
import { UibRuntimePageComponent } from "../uib/uib-runtime/uib-runtime.component";
import { UibEditorPageComponent } from "../uib/uib-editor/uib-editor.component";
import { UibBuildPageComponent } from "../uib/ui-build/uib-build.component";
import { UIBViewSourceComponent } from "../uib/uib-view-source/uib-view-source.component";
import { UIBEditSourceComponent } from "../uib/uib-edit-source/uib-edit-source.component";
import { RuntimeDetailsComponent } from "../uib/runtime-details/runtime-details.component";

declare const SystemJS;

const ruleNodeConfigResourcesModulesMap = {
  "@angular/core": SystemJS.newModule(AngularCore),
  "@angular/common": SystemJS.newModule(AngularCommon),
  "@angular/forms": SystemJS.newModule(AngularForms),
  "@angular/router": SystemJS.newModule(AngularRouter),
  "@angular/cdk/keycodes": SystemJS.newModule(AngularCdkKeycodes),
  "@angular/cdk/coercion": SystemJS.newModule(AngularCdkCoercion),
  "@angular/material/chips": SystemJS.newModule(AngularMaterialChips),
  "@angular/material/autocomplete": SystemJS.newModule(
    AngularMaterialAutocomplete
  ),
  "@angular/material/dialog": SystemJS.newModule(AngularMaterialDialog),
  "@ngrx/store": SystemJS.newModule(NgrxStore),
  rxjs: SystemJS.newModule(RxJs),
  "rxjs/operators": SystemJS.newModule(RxJsOperators),
  "@ngx-translate/core": SystemJS.newModule(TranslateCore),
  "@core/public-api": SystemJS.newModule(VirtuanCore),
  "@shared/public-api": SystemJS.newModule(VirtuanShared),
  "@home/components/public-api": SystemJS.newModule(VirtuanHomeComponents),
  moment: SystemJS.newModule(_moment),
};

@Injectable()
export class RuleChainResolver implements Resolve<RuleChain> {
  constructor(private ruleChainService: RuleChainService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RuleChain> {
    const ruleChainId = route.queryParams.ruleId;
    const username = route.queryParams.username;
    const uid = route.queryParams.ruleprojectUid;
    return this.ruleChainService.getRuleChainWithUsernameAndUID(
      ruleChainId,
      username,
      uid
    );
  }
}

@Injectable()
export class ConnectionPropertyTemplateResolver
  implements Resolve<ConnectionPropertyTemplate[]> {
  constructor(private ruleChainService: RuleChainService) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ConnectionPropertyTemplate[]> {
    return this.ruleChainService.getConnectionPropertyTemplates();
  }
}

@Injectable()
export class ResolvedRuleChainMetaDataResolver
  implements Resolve<ResolvedRuleChainMetaData> {
  constructor(private ruleChainService: RuleChainService) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ResolvedRuleChainMetaData> {
    const ruleChainId = route.queryParams.ruleId;
    const username = route.queryParams.username;
    const uid = route.queryParams.ruleprojectUid;
    return this.ruleChainService.getResolvedRuleChainMetadata(
      ruleChainId,
      username,
      uid
    );
  }
}

@Injectable()
export class RuleNodeComponentsResolver
  implements Resolve<Array<RuleNodeComponentDescriptor>> {
  constructor(private ruleChainService: RuleChainService) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<Array<RuleNodeComponentDescriptor>> {
    const editorType = route.queryParams.editorType;
    const uid = route.queryParams.ruleprojectUid;
    return this.ruleChainService.getRuleNodeComponents(
      ruleNodeConfigResourcesModulesMap,
      uid,
      editorType
    );
  }
}

@Injectable()
export class RuleChainImportGuard implements CanActivate {
  constructor(private itembuffer: ItemBufferService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.itembuffer.hasRuleChainImport()) {
      return true;
    } else {
      return this.router.parseUrl("ruleChains");
    }
  }
}

export const ruleChainBreadcumbLabelFunction: BreadCrumbLabelFunction<RuleChainPageComponent> = (
  route,
  translate,
  component
) => {
  let label: string = component.ruleChain.name;
  if (component.ruleChain.root) {
    label += ` (${translate.instant("rulechain.root")})`;
  }
  return label;
};

export const importRuleChainBreadcumbLabelFunction: BreadCrumbLabelFunction<RuleChainPageComponent> = (
  route,
  translate,
  component
) => {
  return `${translate.instant("rulechain.import")}: ${
    component.ruleChain.name
  }`;
};

const routes: Routes = [
  // {
  //   path: "ruleChains",
  //   component: MainRuleChainComponent,
  //   data: {
  //     breadcrumb: {
  //       label: "",
  //       icon: "settings_ethernet",
  //     },
  //   },
  //   children: [
  //     {
  //       path: ":ruleChainId/:editorType/:username/:uid/:routerType",
  //       component: RuleChainPageComponent,
  //       canDeactivate: [ConfirmOnExitGuard],
  //       data: {
  //         breadcrumb: {
  //           labelFunction: ruleChainBreadcumbLabelFunction,
  //           icon: "settings_ethernet",
  //         } as BreadCrumbConfig<RuleChainPageComponent>,
  //         auth: [Authority.TENANT_ADMIN],
  //         title: "",
  //         import: false,
  //       },
  //       resolve: {
  //         ruleChain: RuleChainResolver,
  //         connectionPropertyTemplates: ConnectionPropertyTemplateResolver,
  //         ruleChainMetaData: ResolvedRuleChainMetaDataResolver,
  //         ruleNodeComponents: RuleNodeComponentsResolver,
  //       },
  //     },
  //   ],
  // },
  {
    path: "design",
    component: DesignViewComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
  },
  {
    path: "service",
    component: ServiceHomeComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
    children: [
      {
        path: "model",
        component: MicroserviceModelComponent,
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
      {
        path: "lambda",
        component: LamdafunctionEditorComponent,
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
      {
        path: "rulechain",
        component: RuleChainPageComponent,
        canDeactivate: [ConfirmOnExitGuard],
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
    ]
  },
  {
    path: "ui",
    component: UiHomeComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
    children: [
      {
        path: "model",
        component: MicroserviceModelComponent,
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
      {
        path: "page-theme",
        component: ThemeUpdateComponent,
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
    ],
  },
  {
    path: "build",
    component: BuildViewComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
  },
  {
    path: "dashboard",
    component: UibDashboardPageComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
  },
  {
    path: "application",
    component: UibApplicationPageComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
  },
  {
    path: "uib-build",
    component: UibBuildPageComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
  },
  {
    path: "runtime",
    component: UibRuntimePageComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
  },
  {
      path: "runtime-view",
      component: RuntimeDetailsComponent,
      data: {
        auth: [Authority.TENANT_ADMIN],
      },
  },
  {
    path: "uib-editor",
    component: UibEditorPageComponent,
    data: {
      auth: [Authority.TENANT_ADMIN],
    },
    children: [
      {
        path: "view-source",
        component: UIBViewSourceComponent,
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
      {
        path: "edit-source",
        component: UIBEditSourceComponent,
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      },
      {
        path: "rulechain",
        component: RuleChainPageComponent,
        canDeactivate: [ConfirmOnExitGuard],
        data: {
          auth: [Authority.TENANT_ADMIN],
        },
      }
    ]
  },
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
    RuleChainImportGuard,
  ],
})
export class RuleChainRoutingModule {}
