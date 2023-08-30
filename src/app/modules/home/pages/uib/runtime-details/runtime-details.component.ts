import { Component, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'runtime-details',
    templateUrl: './runtime-details.component.html',
    encapsulation: ViewEncapsulation.None
  })
  export class RuntimeDetailsComponent implements OnInit {
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
  }
  