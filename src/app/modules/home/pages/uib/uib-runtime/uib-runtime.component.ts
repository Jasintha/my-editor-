import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { Tile } from "../uib-application/uib-application.component";
import { LoginService } from "@app/core/services/login.services";

@Component({
    selector: 'uib-runtime-page',
    templateUrl: './uib-runtime.component.html',
    styleUrls: ['./uib-runtime.component.scss',   
      "../../rulechain/rulechain-page.component.scss"  ],
    encapsulation: ViewEncapsulation.None
  })
  export class UibRuntimePageComponent implements OnInit {

    tiles: Tile[] = [];
    currentTab: string;
    constructor(private router: Router, private loginService: LoginService){}

  ngOnInit(): void {
    this.currentTab = 'runtime'
  }

  openbox(tile: Tile){
    console.log(tile)
  }

    changeSplit(val){
      this.currentTab = val;
      if(val === 'dashboard') {
          this.router.navigate([`dashboard`])    
        } else if (val === 'application') {
          this.router.navigate([`application`])    
        } else if (val === 'runtime'){
          this.router.navigate([`runtime`])    
        }
  }

  logout(){
    this.loginService.logout();
    this.router.navigate(['']);
}

  }
  