import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { Tile } from "../uib-application/uib-application.component";
import { LoginService } from "@app/core/services/login.services";
import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { CreateRuntimeComponent } from "../create-runtime/create-runtime.component";

export type RunTime = {
  name: string
}

@Component({
    selector: 'uib-runtime-page',
    templateUrl: './uib-runtime.component.html',
    styleUrls: ['./uib-runtime.component.scss',   
      "../../rulechain/rulechain-page.component.scss"  ],
    encapsulation: ViewEncapsulation.None
  })
  export class UibRuntimePageComponent implements OnInit {

    currentTab: string;
    routeEnable = false;
    runtimes = [];

    constructor(private router: Router,
       private loginService: LoginService,
       private overlay: Overlay,
       ){}

  ngOnInit(): void {
    this.currentTab = 'runtime'
    this.runtimes = [
      {
        name: 'test 1'
      },
      {
        name: 'test 2'
      }
    ]
  }


    changeSplit(val){
      this.currentTab = val;
      if (val === "dashboard") {
        this.router.navigate([`dashboard`]);
      } else if (val === "application") {
        this.router.navigate([`application`]);
      } else if (val === "runtime") {
        this.router.navigate([`runtime`]);
      } else if (val === "uib-build") {
          this.router.navigate([`uib-build`]);
        }
  }

  toggleOverlay(){
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'mat-elevation-z8',
      positionStrategy: this.overlay
        .position()
        .global()
        .right('0')
        .width('900px'),
    });
    const component = new ComponentPortal(CreateRuntimeComponent);
    const componentRef = overlayRef.attach(component);
    componentRef.instance.dismiss.subscribe(()=> overlayRef.detach())
    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }

  routeHandler(val: boolean){
    this.routeEnable = !this.routeEnable
  }

  logout(){
    this.loginService.logout();
    this.router.navigate(['']);
}

  }
  