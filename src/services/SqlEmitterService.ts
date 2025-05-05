import DbTable from "@/model/DbTable";
import DbTableColumn from "@/model/DbTableColumn";
import DbTableRelation from "@/model/DbTableRelation";
import { SupportedDbKind } from "@/model/SupportedDbKind";
import { useDbConnectionStore } from "@/stores/DbConnectionStore";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import { useDbTableStore } from "@/stores/DbTableStore";
import { useDesignerStateStore } from "@/stores/DesignerStateStore";
import type SqlEmitter from "./sqlEmitters/SqlEmitter";
import SQLiteEmitter from "./sqlEmitters/SQLiteEmitter";
import PostgreSqlEmitter from "./sqlEmitters/PostgreSqlEmitter";
import MySqlEmitter from "./sqlEmitters/MySqlEmitter";
import MsSqlServerEmitter from "./sqlEmitters/MsSqlServerEmitter";
import DbTableRelationKind from "@/model/DbTableRelationKind";
import DbTableInheritanceKind from "@/model/DbTableInheritanceKind";


export default class SqlEmitterService {
    private tables: DbTable[];
    private columns: DbTableColumn[];
    private relations: DbTableRelation[];

    private emitter: SqlEmitter = new SQLiteEmitter();

    constructor() {
        this.tables = [];
        this.columns = [];
        this.relations = [];
    }


    public emitSql() : { subject: string, sql: string }[] {
        this.setupData();
        this.setupEmitter();

        const statements = [];
        
        statements.push({
            subject: 'Preamble',
            sql: this.emitter.emitPreambleSql()
        });
        
        for (const t of this.tables) {
            statements.push({
                subject: 'Table '+ t.name,
                sql: this.emitter.emitCreateTableSql(t)
            });
        }

        return statements;
    }


    private setupData() {
        const { tables } = useDbTableStore();
        const { columns } = useDbTableColumnStore();
        const { relations } = useDbTableRelationStore();

        this.tables = [...tables];
        this.columns = [...columns];
        this.relations = [...relations];

        // this.handleTableInheritance();
        this.handleNNTables();
    }



    private handleTableInheritance() {
        const { selectedTableInheritanceKind } = useDesignerStateStore();

        switch (selectedTableInheritanceKind) {
            case DbTableInheritanceKind.SingleTable:
                this.handleSingleTableInheritance();
                break;
            case DbTableInheritanceKind.ClassTable:
                this.handleClassTableInheritance();
                break;
            case DbTableInheritanceKind.ConcreteTable:
                this.handleConcreteTableInheritance();
                break;
        }
    }

    private handleSingleTableInheritance() {
        throw new Error("Method not implemented.");
    }

    private handleClassTableInheritance() {
        throw new Error("Method not implemented.");
    }

    private handleConcreteTableInheritance() {
        throw new Error("Method not implemented.");
    }


    private handleNNTables() {
        const relsToRemove: DbTableRelation[] = [];

        for (const r of this.relations.filter(r => r.kind == DbTableRelationKind.ManyToMany)) {
            const sourceTab = this.tables.find(t => t.id == r.sourceTableId);
            const sourceCol = this.columns.find(c => c.id == r.sourceColumnId);
            const targetTab = this.tables.find(t => t.id == r.targetTableId);
            const targetCol = this.columns.find(c => c.id == r.targetColumnId);

            // creating a proxy table sitting between those two N-N tables
            if (sourceTab && sourceCol && targetTab && targetCol) {
                const nnTableName = sourceTab.name + "_" + targetTab.name;
                const nnTable = new DbTable({
                    name: nnTableName,
                });
                const nnCol1 = new DbTableColumn({
                    tableId: nnTable.id,
                    name: sourceTab.name + 'Id',
                    type: sourceCol.type,
                    isPrimaryKey: true,
                    isForeignKey: true,
                    isNullable: false,
                });
                const nnCol2 = new DbTableColumn({
                    tableId: nnTable.id,
                    name: targetTab.name + 'Id',
                    type: targetCol.type,
                    isPrimaryKey: true,
                    isForeignKey: true,
                    isNullable: false,
                });
                const nnRel1 = new DbTableRelation({
                    sourceTableId: sourceTab.id,
                    sourceColumnId: sourceCol.id,
                    targetTableId: nnTable.id,
                    targetColumnId: nnCol1.id,
                    kind: DbTableRelationKind.OneToMany,
                });
                const nnRel2 = new DbTableRelation({
                    sourceTableId: targetTab.id,
                    sourceColumnId: targetCol.id,
                    targetTableId: nnTable.id,
                    targetColumnId: nnCol2.id,
                    kind: DbTableRelationKind.OneToMany,
                });

                this.tables.push(nnTable);
                this.columns.push(nnCol1);
                this.columns.push(nnCol2);
                this.relations.push(nnRel1);
                this.relations.push(nnRel2);

                // N-N relationship is no longer needed
                relsToRemove.push(r);
            }
        }

        for (const rel of relsToRemove) {
            const i = this.relations.findIndex(r => r === rel);
            if (i != -1) {
                this.relations.splice(i, 1);
            }
        }
    }


    private setupEmitter() {
        const { dbKind } = useDbConnectionStore();

        switch (dbKind) {
            case SupportedDbKind.SQLite:
                this.emitter = new SQLiteEmitter();
                break;
            case SupportedDbKind.PostgreSQL:
                this.emitter = new PostgreSqlEmitter();
                break;
            case SupportedDbKind.MySQL:
                this.emitter = new MySqlEmitter();
                break;
            case SupportedDbKind.SQLServer:
                this.emitter = new MsSqlServerEmitter();
                break;
            default:
                this.emitter = new SQLiteEmitter();
        }

        this.emitter.setData(this.tables, this.columns, this.relations);
    }
}
