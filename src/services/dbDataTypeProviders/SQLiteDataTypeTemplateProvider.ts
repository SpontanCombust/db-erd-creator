import type DbDataTypeTemplateProvider from "./DbDataTypeTemplateProvider";

export default class SQLiteDataTypeTemplateProvider implements DbDataTypeTemplateProvider {
    availableDataTypeTemplates(): string[] {
        return [
            "INT",
            "INTEGER",
            "TINYINT",
            "SMALLINT",
            "MEDIUMINT",
            "BIGINT",
            "UNSIGNED BIG INT",
            "INT2",
            "INT8",

            "CHARACTER(n)",
            "VARCHAR(n)",
            "VARYING CHARACTER(n)",
            "NCHAR(n)",
            "NATIVE CHARACTER(n)",
            "NVARCHAR(n)",
            "TEXT",
            "CLOB",

            "BLOB",

            "REAL",
            "DOUBLE",
            "DOUBLE PRECISION",
            "FLOAT",

            "NUMERIC",
            "DECIMAL(p, s)",
            "BOOLEAN",
            "DATE",
            "DATETIME"
        ];
    }
}