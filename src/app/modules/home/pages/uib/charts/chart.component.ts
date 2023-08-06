import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import Chart from "chart.js";
import { DonutChart } from "../uib-dashboard/uib-dashboard.component";

@Component({
  selector: "donut-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ChartComponent implements AfterViewInit {
  @ViewChild("chart") chart: ElementRef;

  @Input() data: DonutChart;

  constructor() {}
  ngAfterViewInit(): void {
    const ctx = (<HTMLCanvasElement>this.chart.nativeElement).getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: this.data.data,
            backgroundColor: [
              "lightgreen",
              "lightblue",
              "lightpink",
              "green",
              "blue",
              "red",
              "yellow",
              "#DDBDF1",
            ],
          },
        ],
        labels: this.data.labels,
      },
      options: {
        title: {
          display: true,
          text: this.data.name,
        },
        responsive: true,
      },
    });
  }
}
