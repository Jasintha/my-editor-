import { Injectable, EventEmitter } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BuildWebsocketService {
  public static socket: WebSocket;
  public static listener: EventEmitter<any> = new EventEmitter();

  public constructor() {}

  public connect(email: string) {
    let potocol = 'wss';
    if (window.location.protocol !== 'https:') {
      potocol = 'ws';
    }
    BuildWebsocketService.socket = new WebSocket(potocol + '://' + window.location.hostname + '/ws/' + email);
    BuildWebsocketService.socket.onopen = event => {
      BuildWebsocketService.listener.emit({ type: 'open', data: event });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BuildWebsocketService.socket.onclose = event => {
      setTimeout(() => {
        this.connect(email);
      }, 3000);
    };
    BuildWebsocketService.socket.onmessage = event => {
      BuildWebsocketService.listener.emit({ type: 'message', data: JSON.parse(event.data) });
    };
  }

  public send(data: string) {
    BuildWebsocketService.socket.send(data);
  }

  public close() {
    BuildWebsocketService.socket.close();
  }

  public logSocket() {}

  public getEventListener() {
    return BuildWebsocketService.listener;
  }
} // end class WebSocketService
