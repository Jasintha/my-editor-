import { BehaviorSubject } from "rxjs";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class UibInternalService {
   
   private _action = new BehaviorSubject<string>('');
   private action$ = this._action.asObservable()

   getAction(){
    return this.action$
   }

   setAction(lastUpdate){
    return this._action.next(lastUpdate)
   }
  
  }
  