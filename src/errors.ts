export class EnvError extends Error {
  public envName: string;
  constructor(envName: string, message: string) {
    super(message);
    this.name = EnvError.name;
    this.envName = envName;
  }
}

export class RequiredEnvError extends EnvError {
  constructor(envName: string) {
    super(envName, `${envName} is required`);
  }
}

export class InvalidEnvError extends EnvError {
  constructor(envName: string, value: string, reason?: string) {
    super(
      envName,
      `Value '${value}' is invalid for ${envName}.${
        reason ? ` Reason: ${reason}` : ''
      } `,
    );
  }
}
