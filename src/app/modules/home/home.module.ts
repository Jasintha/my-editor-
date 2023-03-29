///
///
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '@app/shared/shared.module';
import {MatListModule} from '@angular/material/list';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations:
        [
            HomeComponent,
        ],
    exports: [
    ],
    imports: [
        CommonModule,
        SharedModule,
        HomeRoutingModule,
        MatListModule,
        NgbDropdownModule
    ],
    providers: [NgbDropdownModule]
})
export class HomeModule { }
