import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";

const COLUMNS_SCHEMA = [
  {
      key: "label",
      type: "text",
      label: "Label"
  },
  {
      key: "value",
      type: "text",
      label: "Value"
  },
  {
    key: "isEdit",
    type: "isEdit",
    label: ""
}
]

@Component({
    selector: 'runtime-details',
    styleUrls: ['./runtime-details.component.scss'],
    templateUrl: './runtime-details.component.html',
    encapsulation: ViewEncapsulation.None
  })
  export class RuntimeDetailsComponent implements OnInit {
    currentTab: string;

    displayedColumns: string[] = [ 'label', 'value'];
  dataSource = [
    {
      label: 'test1',
      value: 'ttt'
    }
  ];

  columnsSchema: any = COLUMNS_SCHEMA;


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

 saveChanges(){
  console.log(this.dataSource)
 }

 logout(){
   this.loginService.logout();
   this.router.navigate(['']);
}

 }
 