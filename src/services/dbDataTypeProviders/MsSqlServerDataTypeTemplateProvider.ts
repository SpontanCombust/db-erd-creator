import type DbDataTypeTemplateProvider from "./DbDataTypeTemplateProvider";

export default class MsSqlServerDataTypeTemplateProvider implements DbDataTypeTemplateProvider {
    availableDataTypeTemplates(): string[] {
        return [
            "BIGINT",
            "INT",
            "SMALLINT",
            "TINYINT",
            "BIT",
            "DECIMAL(p,s)",
            "NUMERIC(p,s)",
            "MONEY",
            "SMALLMONEY",

            "FLOAT(n)",
            "REAL",

            "DATE",
            "TIME(p)",
            "DATETIME2(p)",
            "DATETIMEOFFSET(p)",
            "DATETIME",
            "SMALLDATETIME",

            "CHAR(n)",
            "VARCHAR(n)",

            "NTEXT",
            "TEXT",
            "IMAGE",

            "BINARY(n)",
            "VARBINARY(n)",

            "GEOGRAPHY",
            "GEOMETRY",
            "JSON",
            "VECTOR(d)",
            "ROWVERSION",
            "SQL_VARIANT",
            "UNIQUEIDENTIFIER",
            "XML"
        ];
    }
}