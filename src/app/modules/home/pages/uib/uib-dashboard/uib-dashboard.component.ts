import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { UIBService } from "@app/core/projectservices/uib.service";
import { LoginService } from "@app/core/services/login.services";

export interface DonutChart {
  name: string;
  data: number[];
  labels: string[];
}

export interface DashboardWidget {
  title: string;
  count: string;
  icon: Icon;
}

export interface Icon {
  name: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: "uib-dashboard-page",
  templateUrl: "./uib-dashboard.component.html",
  styleUrls: [
    "./uib-dashboard.component.scss",
    "../../rulechain/rulechain-page.component.scss",
  ],
  encapsulation: ViewEncapsulation.None,
})
export class UibDashboardPageComponent implements OnInit {
  currentTab: string;
  widgets = []
  constructor(private router: Router, private loginService: LoginService,
    private uibService: UIBService) {}

  ngOnInit(): void {
    this.currentTab = "dashboard";
    this.queryWidgets()
  }

  queryWidgets(){
    this.uibService.queryDashboard().subscribe({
      next: (value)=> {
        this.widgets = value as any
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  changeSplit(val) {
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    }  else if (val === "uib-runtime") {
      this.router.navigate([`runtime`]);
    } else if (val === "uib-build") {
        this.router.navigate([`uib-build`]);
      }
  }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }
}
