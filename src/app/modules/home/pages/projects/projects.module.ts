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

const ENTITY_STATES = [...projectsRoute];

@NgModule({
  imports: [
    // TestSharedModule,
    // NgxSpinnerModule,
    ButtonModule,
    PanelModule,
    DataViewModule,
    RadioButtonModule,
    CheckboxModule,
    DropdownModule,
    RouterModule.forChild(ENTITY_STATES),
    LottieAnimationViewModule.forRoot(),
  ],
  declarations: [ProjectsComponent],
  providers: [],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArtifactsModule {}
