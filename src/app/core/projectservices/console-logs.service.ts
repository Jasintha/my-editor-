import { Injectable } from '@angular/core';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';

@Injectable({ providedIn: 'root' })
export class ConsoleLogService {
    public static consoleLog = '';

    public constructor(
        protected eventManager: EventManagerService,
    ) {}

    public readConsoleLog() {
        return ConsoleLogService.consoleLog;
    }

    public writeConsoleLog(log) {
        ConsoleLogService.consoleLog += log;
        ConsoleLogService.consoleLog += ';\n';
        this.eventManager.dispatch(
            new AppEvent(EventTypes.consoleLogsUpdated, { name: 'consoleLogsUpdated', content: log })
        );
    }

    public clearConsoleLog() {
        ConsoleLogService.consoleLog = '';
        this.eventManager.dispatch(
            new AppEvent(EventTypes.consoleLogsUpdated, { name: 'consoleLogsUpdated', content: '' })
        );
    }
}
