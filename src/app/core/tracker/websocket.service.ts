import { Injectable, EventEmitter } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  public static socket: WebSocket;
  public static socketFE: WebSocket;
  public static socketBE: WebSocket;
  public static listener: EventEmitter<any> = new EventEmitter();
  public static listenerFE: EventEmitter<any> = new EventEmitter();
  public static listenerBE: EventEmitter<any> = new EventEmitter();
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

  public sendFE(data: string) {
    WebsocketService.socketFE.send(data);
  }

  public closeFE() {
    WebsocketService.socketFE.close();
  }

  public sendBE(data: string) {
    WebsocketService.socketBE.send(data);
  }

  public closeBE() {
    WebsocketService.socketBE.close();
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

  public connectGenStatusSockets(email: string) {
    let potocol = 'wss';
    if (window.location.protocol !== 'https:') {
      potocol = 'ws';
    }
    this.connectBESocket(email, potocol);
    this.connectFESocket(email, potocol)
  }

  connectFESocket(email, protocol){
    WebsocketService.socketFE = new WebSocket(protocol + '://' + window.location.hostname + '/ws/f/' + email);
    WebsocketService.socketFE.onopen = event => {
      WebsocketService.listenerFE.emit({ type: 'open', data: event });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    WebsocketService.socketFE.onclose = event => {
      setTimeout(() => {
        this.connectFESocket(email, protocol);
      }, 1000);
    };
    WebsocketService.socketFE.onmessage = event => {
      WebsocketService.listenerFE.emit({ type: 'message', data: JSON.parse(event.data) });
    };
  }
  connectBESocket(email, protocol) {
    WebsocketService.socketBE = new WebSocket(protocol + '://' + window.location.hostname + '/ws/b/' + email);
    WebsocketService.socketBE.onopen = event => {
      WebsocketService.listenerBE.emit({ type: 'open', data: event });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    WebsocketService.socketBE.onclose = event => {
      setTimeout(() => {
        this.connectBESocket(email,protocol);
      }, 1000);
    };
    WebsocketService.socketBE.onmessage = event => {
      WebsocketService.listenerBE.emit({ type: 'message', data: JSON.parse(event.data) });
    };
  }
  public getBEEventListener() {
    return WebsocketService.listenerBE;
  }
  public getFEEventListener() {
    return WebsocketService.listenerFE;
  }


  public getEventListener() {
    return WebsocketService.listener;
  }
} // end class WebSocketService
