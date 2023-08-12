import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
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
  chartList = [
    {
      name: "Sample 1",
      data: [50, 50],
      labels: ["A", "B"],
    },
    {
      name: "Sample 2",
      data: [25, 25, 50],
      labels: ["A", "B", "C"],
    },
    {
      name: "Sample 3",
      data: [10, 20, 20, 50],
      labels: ["A", "B", "C", "D"],
    },
    {
      name: "Sample 4",
      data: [25, 25, 50],
      labels: ["A", "B", "C"],
    },
    {
      name: "Sample 5",
      data: [10, 15, 20, 50, 5],
      labels: ["A", "B", "C", "D", "E"],
    },
  ];
  rules = [
    { id: 1, name: "Rule1", selected: true },
    { id: 2, name: "Rule2", selected: true },
    { id: 3, name: "Rule3", selected: true },
  ];

  widgets = [
    {
      title: 'Synced',
			count: '21',
			icon: {
				name: 'sync',
				color: 'green',
				bgColor: 'lightgreen'
			}
    },
    {
      title: 'Healthy',
			count: '21',
			icon: {
				name: 'favorite',
				color: 'green',
				bgColor: 'lightgreen'
			}
    },
    {
      title: 'Suspended',
			count: '0',
			icon: {
				name: 'pause_circle',
				color: 'plum',
				bgColor: '#dae3f0'
			}
    },
    {
      title: 'Processing',
			count: '0',
			icon: {
				name: 'donut_large',
				color: 'blue',
				bgColor: 'lightblue'
			}
    },
    {
      title: 'Unknown',
			count: '0',
			icon: {
				name: 'help',
				color: 'gray',
				bgColor: '#dae3f0'
			}
    },
    {
      title: 'Missing',
			count: '0',
			icon: {
				name: 'domino_mask',
        color: 'yellow',
				bgColor: '#F6CE79'
			}
    },
    {
      title: 'Degraded',
			count: '0',
			icon: {
				name: 'heart_broken',
				color: 'red',
				bgColor: '#F69479'
			}
    },
    {
      title: 'OutofSync',
			count: '0',
			icon: {
				name: 'straight',
				color: 'yellow',
				bgColor: '#F6CE79'
			}
    },
  ];

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    this.currentTab = "dashboard";
  }

  changeSplit(val) {
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    } else if (val === "uib-editor") {
      this.router.navigate([`uib-editor`]);
    } else if (val === "uib-build") {
        this.router.navigate([`uib-build`]);
      }
  }

  // updateQuery(rule) {
  //   if (rule.selected && rule.id === 1) {
  //     this.chartList = [
  //       ...this.chartList,
  //       {
  //         name: "Sample 1",
  //         data: [50, 50],
  //         labels: ["A", "B"],
  //       },
  //     ];
  //   } else if (!rule.selected && rule.id === 1) {
  //     this.chartList.splice(0, 1);
  //   } else if (rule.selected && rule.id === 2) {
  //     this.chartList = [
  //       ...this.chartList,
  //       {
  //         name: "Sample 2",
  //         data: [25, 25, 50],
  //         labels: ["A", "B", "C"],
  //       },
  //     ];
  //   } else if (!rule.selected && rule.id === 2) {
  //     this.chartList.splice(1, 1);
  //   } else if (rule.selected && rule.id === 3) {
  //     this.chartList = [
  //       ...this.chartList,
  //       {
  //         name: "Sample 3",
  //         data: [10, 20, 20, 50],
  //         labels: ["A", "B", "C", "D"],
  //       },
  //     ];
  //   } else if (!rule.selected && rule.id === 3) {
  //     this.chartList.splice(2, 1);
  //   }
  // }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }
}
