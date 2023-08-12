import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
  } from "@angular/core";
  import { SelectItem } from "primeng/api";
  import { IMainMenu, MainMenu } from "@shared/models/model/main-menu.model";
  import { FormBuilder, FormGroup, Validators } from "@angular/forms";
  import { BuiltInPageService } from "@core/projectservices/built-in-page.service";
  import { ProjectService } from "@core/projectservices/project.service";
  import { ActivatedRoute, Router } from "@angular/router";
  import { MainMenuService } from "@core/projectservices/main-menu.service";
  import { CustomPageService } from "@core/projectservices/custom-page.service";
  import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
  import { filter, map } from "rxjs/operators";
  import { Observable } from "rxjs";
  import { IHybridfunction } from "@shared/models/model/hybridfunction.model";
  import { IApi } from "@shared/models/model/microservice-api.model";
  import { EventManagerService } from "@shared/events/event.type";
  import { AppEvent } from "@shared/events/app.event.class";
  import { EventTypes } from "@shared/events/event.queue";
  import { NgxSpinnerService } from "ngx-spinner";
  import {
    trigger,
    state,
    style,
    transition,
    animate,
  } from "@angular/animations";
  import { IFormField } from "@shared/models/model/form-field.model";
  import { IEpicService } from "@shared/models/model/epic-service.model";
  import {
    EpicServiceGenReq,
    IEpicServiceBuildStatus,
  } from "@shared/models/model/epic-service-build-status.model";
  import { MatTableDataSource } from "@angular/material/table";
  import { MatPaginator } from "@angular/material/paginator";
  import { MatSort } from "@angular/material/sort";
  import { WebsocketService } from "@core/tracker/websocket.service";
  import { BreakpointTrackerService } from "@core/tracker/breakpoint.service";
  import {
    GeneratorComponents,
    IGenerator,
  } from "@shared/models/model/generator-chain.model";
  import { LoginService } from "@app/core/services/login.services";
  import { GeneratorChainService } from "../../build-view/generator-chain.service";
  
  @Component({
    selector: "dynamic-search",
    templateUrl: "./dynamic-search.component.html",
    styleUrls: [
      "./dynamic-search.component.scss"
    ],
  })
  export class DynamicSearchComponent {
    title = 'angular-text-search-highlight';
    searchText = '';
    characters = [
      'Ant-Man',
      'Aquaman',
      'Asterix',
      'The Atom',
      'The Avengers',
      'Batgirl',
      'Batman',
      'Batwoman',
      'Black Canary',
      'Black Panther',
      'Captain America',
      'Captain Marvel',
      'Catwoman',
      'Conan the Barbarian',
      'Daredevil',
      'The Defenders',
      'Doc Savage',
      'Doctor Strange',
      'Elektra',
      'Fantastic Four',
      'Ghost Rider',
      'Green Arrow',
      'Green Lantern',
      'Guardians of the Galaxy',
      'Hawkeye',
      'Hellboy',
      'Incredible Hulk',
      'Iron Fist',
      'Iron Man',
      'Marvelman',
      'Robin',
      'The Rocketeer',
      'The Shadow',
      'Spider-Man',
      'Sub-Mariner',
      'Supergirl',
      'Superman',
      'Teenage Mutant Ninja Turtles',
      'Thor',
      'The Wasp',
      'Watchmen',
      'Wolverine',
      'Wonder Woman',
      'X-Men',
      'Zatanna',
      'Zatara',
    ];
}