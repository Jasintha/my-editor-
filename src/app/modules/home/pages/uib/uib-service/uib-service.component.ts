import { Component, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";
  
  @Component({
    selector: "uib-service-page",
    templateUrl: "./uib-service.component.html",
    styleUrls: [
      "./uib-service.component.scss",
       "../../rulechain/rulechain-page.component.scss",
    ],
    encapsulation: ViewEncapsulation.None
  })
  export class UibServicePageComponent {

    constructor(private router: Router, private loginService: LoginService){}

    changeSplit(val){
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
  