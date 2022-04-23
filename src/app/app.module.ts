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

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from '@core/core.module';
import { LoginModule } from '@home/pages/login/login.module';
import { HomeModule } from '@home/home.module';

import { AppComponent } from './app.component';
// import { DashboardRoutingModule } from '@modules/dashboard/dashboard-routing.module';
import { RouterModule, Routes } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatRadioModule} from '@angular/material/radio';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {CommonModule} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { NgxWebstorageModule } from 'ngx-webstorage';
import {ProjectsModule} from '@home/pages/projects/projects.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {GlobalHttpInterceptor} from '@core/interceptors/global-http-interceptor';

const routes: Routes = [
  { path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    LoginModule,
    ProjectsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatTableModule,
    NgxWebstorageModule.forRoot({ prefix: 'twillo', separator: '-' }),
  ],
  exports: [RouterModule]
})
export class PageNotFoundRoutingModule { }


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    LoginModule,
    HomeModule,
//    DashboardRoutingModule,
    PageNotFoundRoutingModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalHttpInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
