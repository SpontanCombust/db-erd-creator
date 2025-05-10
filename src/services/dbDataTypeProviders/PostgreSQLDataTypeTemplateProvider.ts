import type DbDataTypeTemplateProvider from "./DbDataTypeTemplateProvider";


export default class PostgreSQLDataTypeTemplateProvider implements DbDataTypeTemplateProvider {
    availableDataTypeTemplates(): string[] {
        return [
            "BIGINT", "INT8",
            "BIGSERIAL", "SERIAL8",
            "BIT(n)",
            "BIT VARYING(n)", "VARBIT(n)",
            "BOOLEAN", "BOOL",
            "BOX",
            "BYTEA",
            "CHARACTER(n)", "CHAR(n)",
            "CHARACTER VARYING(n)", "VARCHAR(n)",
            "CIDR",
            "CIRCLE",
            "DATE",
            "DOUBLE PRECISION", "FLOAT8",
            "INET",
            "INTEGER", "INT", "INT4",
            "INTERVAL",
            "JSON",
            "JSONB",
            "LINE",
            "LSEG",
            "MACADDR",
            "MACADDR8",
            "MONEY",
            "NUMERIC(p,s)", "DECIMAL(p,s)",
            "PATH",
            "PG_LSN",
            "PG_SNAPSHOT",
            "POINT",
            "POLYGON",
            "REAL", "FLOAT4",
            "SMALLINT", "INT2",
            "SMALLSERIAL", "SERIAL2",
            "SERIAL", "SERIAL4",
            "TEXT",
            "TIME(p)",
            "TIME(p) WITH TIME ZONE", "TIMETZ",
            "TIMESTAMP(p)",
            "TIMESTAMP(p) WITH TIME ZONE", "TIMESTAMPTZ",
            "TSQUERY",
            "TSVECTOR",
            "TXID_SNAPSHOT",
            "UUID",
            "XML"
        ];
    }
}