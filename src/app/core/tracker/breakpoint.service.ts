import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BreakpointTrackerService {
  public static breakpoint: number;

  public constructor() {}

  public getBreakpoint() {
    return BreakpointTrackerService.breakpoint;
  }

  public setBreakpoint(breakpoint) {
    return (BreakpointTrackerService.breakpoint = breakpoint);
  }
}
