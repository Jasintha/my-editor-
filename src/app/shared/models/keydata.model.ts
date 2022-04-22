export interface IKeyData {
  key?: string;
  value?: string;
}

export class KeyData implements IKeyData {
  constructor(public key?: string, public value?: string) {}
}
