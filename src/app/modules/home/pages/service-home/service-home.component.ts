import {ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {trigger, state, style, transition, animate} from '@angular/animations';

@Component({
    selector: 'virtuan-service-home',
    templateUrl: './service-home.component.html',
    styleUrls: ['./service-home.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class ServiceHomeComponent implements OnInit {

    constructor(
        protected builtInPageService: BuiltInPageService,
    ) {
    }

    ngOnInit(): void {
    }
}
