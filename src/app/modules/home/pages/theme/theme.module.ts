import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SidebarModule } from 'primeng/sidebar';
// import { TestSharedModule } from 'app/shared';
import {
  ThemeComponent,
  ThemeDetailComponent,
  ThemeUpdateComponent,
  ThemeDeletePopupComponent,
  ThemeDeleteDialogComponent,
  themeRoute,
  themePopupRoute,
} from './';
import {ReactiveFormsModule} from '@angular/forms';

const ENTITY_STATES = [...themeRoute, ...themePopupRoute];

@NgModule({
    imports: [
        // TestSharedModule,
        TableModule,
        InputSwitchModule,
        NgxSpinnerModule,
        RadioButtonModule,
        ButtonModule,
        FileUploadModule,
        PanelModule,
        DataViewModule,
        MultiSelectModule,
        DropdownModule,
        RouterModule.forChild(ENTITY_STATES),
        SidebarModule,
        ReactiveFormsModule,
    ],
    declarations: [ThemeComponent, ThemeDetailComponent, ThemeUpdateComponent, ThemeDeleteDialogComponent, ThemeDeletePopupComponent],

    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        ThemeUpdateComponent
    ]
})
export class TestThemeModule {}
