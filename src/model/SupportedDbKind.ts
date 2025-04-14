export enum SupportedDbKind {
    SQLite,
    PostgreSQL,
    MySQL,
    SQLServer
};

export function readSupportedDbKind(driver: string) : SupportedDbKind | undefined {
  if (driver.includes('SQLite')) {
    return SupportedDbKind.SQLite;
  }
  if (driver.includes('PostgreSQL')) {
    return SupportedDbKind.PostgreSQL;
  }
  if (driver.includes('MySQL')) {
    return SupportedDbKind.MySQL;
  }
  if (driver.includes('SQL Server')) {
    return SupportedDbKind.SQLServer;
  }

  return undefined;
}

export function filterSupportedDbKinds(drivers: string[]) : string[] {
  return drivers.filter(d => readSupportedDbKind(d) != undefined);
}

export function defaultDbPort(kind: SupportedDbKind) : number {
  switch (kind) {
    case SupportedDbKind.SQLite: return 0; // not used
    case SupportedDbKind.PostgreSQL: return 5432;
    case SupportedDbKind.MySQL: return 3306;
    case SupportedDbKind.SQLServer: return 1433;
  }
}