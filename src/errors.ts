export class EnvException extends Error {
  constructor(message: string) {
    super(message);
    this.name = EnvException.name;
  }
}

export class GetPropValueException extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(public valueName: string, public value: any, message?: string) {
    super(message);
  }
}

export class InvalidPropValueException extends GetPropValueException {}
export class RequiredPropValueException extends GetPropValueException {}
