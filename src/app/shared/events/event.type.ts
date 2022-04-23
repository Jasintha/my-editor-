import { EventTypes } from './event.queue';
import { Observable, Subject } from 'rxjs';
import { AppEvent } from './app.event.class';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EventManagerService {
  private eventHandler = new Subject<AppEvent<any>>();

  on(eventType: EventTypes): Observable<AppEvent<any>> {
    return this.eventHandler.pipe(filter(event => event.type === eventType));
  }

  dispatch<T>(event: AppEvent<T>): void {
    this.eventHandler.next(event);
  }
}
