import type DbDataTypeTemplateProvider from "./DbDataTypeTemplateProvider";

export default class MySqlDataTypeTemplateProvider implements DbDataTypeTemplateProvider {
    availableDataTypeTemplates(): string[] {
        return [
            "TINYINT",
            "SMALLINT",
            "MEDIUMINT",
            "INT", "INTEGER",
            "BIGINT",
            "BIT", "BOOL",

            "FLOAT",
            "DOUBLE",
            "DOUBLE PRECISION", "REAL",
            "DECIMAL(m, d)", "DEC(m, d)", "NUMERIC(m, d)",

            "DATE",
            "DATETIME",
            "TIMESTAMP(n)",
            "TIME",
            "YEAR(n)",

            "CHAR(m)",
            "VARCHAR(m)",

            "TINYBLOB", "TINYTEXT",
            "BLOB", "TEXT",
            "MEDIUMBLOB", "MEDIUMTEXT",
            "LONGBLOB", "LONGTEXT",

            "JSON"
        ];
    }
}