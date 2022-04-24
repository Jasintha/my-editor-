import { Injectable, EventEmitter } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  public static socket: WebSocket;
  public static listener: EventEmitter<any> = new EventEmitter();

  public constructor() {
    /*  this.socket = new WebSocket("ws://localhost:8080/ws");
      this.socket.onopen = event => {
          this.listener.emit({"type": "open", "data": event});
      }
      this.socket.onclose = event => {
          this.listener.emit({"type": "close", "data": event});
      }
      this.socket.onmessage = event => {
          this.listener.emit({"type": "message", "data": JSON.parse(event.data)});
      }
      */
  }

  public connect(email: string) {
    // WebsocketService.socket = new WebSocket('ws://' + window.location.hostname + ':8080/ws/' + email);
    let potocol = 'wss';
    if (window.location.protocol !== 'https:') {
      potocol = 'ws';
    }
    WebsocketService.socket = new WebSocket(potocol + '://' + window.location.hostname + '/ws/' + email);
    WebsocketService.socket.onopen = event => {
      WebsocketService.listener.emit({ type: 'open', data: event });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    WebsocketService.socket.onclose = event => {
      // WebsocketService.listener.emit({ type: 'close', data: event });
      setTimeout(() => {
        this.connect(email);
      }, 1000);
    };
    WebsocketService.socket.onmessage = event => {
      WebsocketService.listener.emit({ type: 'message', data: JSON.parse(event.data) });
    };
  }

  public send(data: string) {
    WebsocketService.socket.send(data);
  }

  public close() {
    WebsocketService.socket.close();
  }

  public logSocket() {
    // console.log(WebsocketService.socket);
    // socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING ? true : false; –
  }

  public getEventListener() {
    return WebsocketService.listener;
  }
} // end class WebSocketService
