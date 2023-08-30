import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";

@Component({
    selector: 'runtime-details',
    styleUrls: ['./runtime-details.component.scss'],
    templateUrl: './runtime-details.component.html',
    encapsulation: ViewEncapsulation.None
  })
  export class RuntimeDetailsComponent implements OnInit {
    currentTab: string;

    displayedColumns: string[] = [ 'name', 'value'];
  dataSource = [
    {
      name: 'test1',
      value: 'ttt'
    }
  ];

    constructor(private router: Router,
      private loginService: LoginService,
      ){}

 ngOnInit(): void {
   this.currentTab = 'runtime'
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
 
 backToParent(){
  this.router.navigate([`runtime`]);
 }

 logout(){
   this.loginService.logout();
   this.router.navigate(['']);
}

 }
 