import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { UIBService } from "@app/core/projectservices/uib.service";
import {Application} from 'src/app/modules/home/pages/uib/uib-application/uib-application.component'
import { Router } from "@angular/router";
import { RunTime } from "../uib-runtime/uib-runtime.component";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'runtime-card',
    templateUrl: './runtime-card.component.html',
    styleUrls: ['./runtime-card.component.scss'],
    encapsulation: ViewEncapsulation.None
  })
  export class RuntimeCardComponent implements OnInit {
  @Input()app: RunTime ;

    constructor(private router: Router){}

    ngOnInit(){
    }

    openCard(app) {
      this.router.navigate(["runtime-view"], {
        queryParams: {
          runtimeId: app.id
        }
      })
    }
  }
  