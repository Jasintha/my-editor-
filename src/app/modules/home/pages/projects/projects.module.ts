import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

// import { TestSharedModule } from 'app/shared';
// import { WebsocketService } from 'app/core/tracker/websocket.service';
import { LottieAnimationViewModule } from 'ng-lottie';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
// import { NgxSpinnerModule } from 'ngx-spinner';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { projectsRoute } from './projects.route';
import { ProjectsComponent } from './projects.component';
import {CommonModule} from '@angular/common';
import {SplitButtonModule} from 'primeng/splitbutton';
import {WebsocketService} from '@core/tracker/websocket.service';

const ENTITY_STATES = [...projectsRoute];

@NgModule({
    imports: [
        ButtonModule,
        PanelModule,
        DataViewModule,
        RadioButtonModule,
        SplitButtonModule,
        CheckboxModule,
        DropdownModule,
        RouterModule.forChild(ENTITY_STATES),
        LottieAnimationViewModule.forRoot(),
        CommonModule,
    ],
    declarations: [
        ProjectsComponent
    ],
    providers: [],
    exports: [ProjectsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProjectsModule {}