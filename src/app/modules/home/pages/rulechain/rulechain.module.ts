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
import { MonacoEditorModule } from 'ngx-monaco-editor';


import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {DesignEditorComponent} from '@home/pages/rulechain/design-editor/design-editor.component';
import {CreateRequirementComponent} from '@home/pages/rulechain/design-editor/create-requirement.component';
import {CreateStoryComponent} from '@home/pages/rulechain/design-editor/create-story.component';
import {RequirementAddEpicDialogComponent} from '@home/pages/rulechain/design-editor/requirement-add-epic-dialog.component';
import {FlexModule} from '@angular/flex-layout';
import { EditorModule } from 'primeng/editor';

import {CreateApiModule} from '@home/pages/create-api/create-api.module';
import {CreateSubruleModule} from '@home/pages/create-subrule/create-subrule.module';
import {CreateModelModule} from '@home/pages/create-model/create-model.module';
import {CreateEventModule} from '@home/pages/create-event/create-event.module';
import {ServicefileModule} from '@home/pages/servicefile/servicefile.module';
import {CreateHybridfunctionModule} from '@home/pages/create-hybridfunction/create-hybridfunction.module';
import {CreateLamdafunctionModule} from '@home/pages/create-lamdafunction/create-lamdafunction.module';
import {CreateTaskModule} from '@home/pages/create-task/create-task.module';
import {TestThemeModule} from '@home/pages/theme/theme.module';
import {AggregateModule} from '@home/pages/aggregate/aggregate.module';
import {CreateServiceModule} from '@home/pages/create-service/create-service.module';
import {BuiltInPageModule} from '@home/pages/built-in-page/built-in-page.module';
import {InitPageCreationComponent} from '@home/pages/built-in-page/init-page-creation.component';
import { MainMenuModule } from '../main-menu/main-menu.module';
import {PageNavigationModule} from '@home/pages/page-navigation/page-navigation.module';
import {CreateTextComponent} from '@home/pages/rulechain/design-editor/create-text.component';
import {UiHomeComponent} from '@home/pages/ui-home/ui-home.component';
import {ServiceHomeComponent} from '@home/pages/service-home/service-home.component';
import {
  AddDesignRuleNodeDialogComponent,
  AddDesignRuleNodeLinkDialogComponent,
  StoryDesignPageComponent
} from './story-design-page.component';
import {EditEpicComponent} from '@home/pages/rulechain/design-editor/edit-epic/edit-epic.component';
import {DeleteDesignComponent} from '@home/pages/rulechain/design-editor/delete-design.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CarouselModule} from 'primeng/carousel';
import {EnvSelectComponent} from '@home/pages/rulechain/env-select.component';
import {DataViewModule} from 'primeng/dataview';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RadioButtonModule} from 'primeng/radiobutton';
import { ChartsModule } from 'ng2-charts';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import { PickListModule } from 'primeng/picklist';
import {TabPageComponent} from '@home/pages/built-in-page/tab-page.component';
import {ListboxModule} from 'primeng/listbox';
import {ActorDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/actor.design-view.component';
import {ModelDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/model-design-view.component';
import {ProcessDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/process-design-view.component';
import {ScreenDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/screen-design-view.component';
import {TreeModule} from 'primeng/tree';
import {TreeNode} from 'primeng/api';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DesignWarningComponent} from '@home/pages/rulechain/design-editor/design-warning.component';
import {SubMenuModule} from '@home/pages/sub-menu/sub-menu.module';
import {BuildViewModule} from '@home/pages/build-view/build-view.module';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { DesignViewComponent } from '../design-view/design-view.component';
import { UibDashboardPageComponent } from '../uib/uib-dashboard/uib-dashboard.component';
import { UibApplicationPageComponent } from '../uib/uib-application/uib-application.component';
import { UibRuntimePageComponent } from '../uib/uib-runtime/uib-runtime.component';
import { ChartComponent } from '../uib/charts/chart.component';
import { UibEditorPageComponent } from '../uib/uib-editor/uib-editor.component';
import { GridTileComponent } from '../uib/grid-tile/grid-tile.component';
import { DashboardTileComponent } from '../uib/dashboard-tile/dashboard-tile.component';
import { UibBuildPageComponent } from '../uib/ui-build/uib-build.component';
import { FilterPipe } from '../uib/dynamic-search/pips/filter.pipe';
import { HighlightDirective } from '../uib/dynamic-search/directives/highlighter.directive';
import { DynamicSearchComponent } from '../uib/dynamic-search/dynamic-search.component';
import { CreateProjectComponent } from '../uib/create-project/create-project.component';

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
    AddRuleNodeDialogComponent,
    AddRuleNodeDialogComponent,
    AddDesignRuleNodeDialogComponent,
    AddDesignRuleNodeLinkDialogComponent,
    StoryDesignPageComponent,
    DesignEditorComponent,
    CreateRequirementComponent,
    CreateTextComponent,
    RequirementAddEpicDialogComponent,
    CreateStoryComponent,
      EditEpicComponent,
    DeleteDesignComponent,
      EnvSelectComponent,
      TabPageComponent,
      ActorDesignViewComponent,
    ModelDesignViewComponent,
    ProcessDesignViewComponent,
    ScreenDesignViewComponent,
    DesignWarningComponent,
    UiHomeComponent,
    ServiceHomeComponent,
    DesignViewComponent,
    UibDashboardPageComponent,
    UibApplicationPageComponent,
    UibRuntimePageComponent,
    UibEditorPageComponent,
    GridTileComponent,
    DashboardTileComponent,
    ChartComponent,
    UibBuildPageComponent,
    DynamicSearchComponent,
    CreateProjectComponent,
    HighlightDirective,
    FilterPipe
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
    CreateTaskModule,
    AggregateModule,
    TestThemeModule,
    MonacoEditorModule,
    CreateServiceModule,
    CreateServiceModule,
    BuiltInPageModule,
    ServicefileModule,
    MainMenuModule,
    SubMenuModule,
    BuildViewModule,
    PageNavigationModule,
    RouterModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatRadioModule,
    FormsModule,
    MatTableModule,
    MatSnackBarModule,
    FlexModule,
    EditorModule,
    NgbModule,
    FontAwesomeModule,
    MatTooltipModule,
    CarouselModule,
    DataViewModule,
    MatProgressBarModule,
    RadioButtonModule,
    ChartsModule,
    MatChipsModule,
    MatStepperModule,
    PickListModule,
    ListboxModule,
    TreeModule,
    ContextMenuModule,
    MatButtonToggleModule
  ]
})
export class RuleChainModule { }
