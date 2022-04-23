import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GentypeTrackerService {
  public static gentype: string;

  public constructor() {}

  public getGentype() {
    return GentypeTrackerService.gentype;
  }

  public setGentype(gentype) {
    return (GentypeTrackerService.gentype = gentype);
  }
}
