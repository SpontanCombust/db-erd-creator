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

    // dictionary mapping table id to the id of its direct parent table
    // if a table has no parent, id is mapped to itself
    private tableToBaseTableCache: Map<string, string> = new Map();
    // dictionary mapping table id to the id of its most base table in its inheritance hierarchy
    // if a table has no parent, id is mapped to itself
    private tableToRootTableCache: Map<string, string> = new Map();

    private emitter: SqlEmitter = new SQLiteEmitter();


    constructor() {
        this.tables = [];
        this.columns = [];
        this.relations = [];

        this.tableToBaseTableCache = new Map();
        this.tableToRootTableCache = new Map();
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

        this.cacheInheritanceRelations();
        this.processTableInheritance();
        this.processNNRelations();
    }


    private cacheInheritanceRelations() {
        const inheritanceRelations = this.relations.filter(r => r.kind === DbTableRelationKind.InheritsFrom);
        
        for (const table of this.tables) {
            this.cacheBaseTableForTable(table.id, inheritanceRelations);
        }

        for (const table of this.tables) {
            this.cacheRootTableForTable(table.id);
        }
    }

    private cacheBaseTableForTable(tableId: string, inheritanceRelations: DbTableRelation[]) : string {
        let baseTableId = inheritanceRelations
            .find(r => r.sourceTableId == tableId)
            ?.targetTableId
            ?? null;
    
        if (!baseTableId) {
            baseTableId = tableId;
        }

        this.tableToBaseTableCache.set(tableId, baseTableId);
        return baseTableId;
    }
    
    private cacheRootTableForTable(tableId: string) : string {
        const remembered = this.tableToRootTableCache.get(tableId);
        if (remembered) {
            return remembered;
        } else {
            const baseTableId = this.tableToBaseTableCache.get(tableId)!;
            if (tableId == baseTableId) {
                this.tableToRootTableCache.set(tableId, tableId);
                return tableId;
            } else {
                const rootTableId = this.cacheRootTableForTable(baseTableId);
                this.tableToRootTableCache.set(tableId, rootTableId);
                return rootTableId;
            }
        }
    }



    private processTableInheritance() {
        const { selectedTableInheritanceKind } = useDesignerStateStore();

        switch (selectedTableInheritanceKind) {
            case DbTableInheritanceKind.SingleTable:
                this.processSingleTableInheritance();
                break;
            case DbTableInheritanceKind.ClassTable:
                this.processClassTableInheritance();
                break;
            case DbTableInheritanceKind.ConcreteTable:
                this.processConcreteTableInheritance();
                break;
        }

        // remove all inheritance relations, they're no longer needed
        this.relations = this.relations.filter(r => r.kind != DbTableRelationKind.InheritsFrom);
    }

    private processSingleTableInheritance() {
        // maps identifier of the root table to identifiers of all its descendant tables
        const mergeGroups = new Map<string, string[]>;
        
        // preparing inheritance trees that should be merged into one table
        for (const table of this.tables) {
            const rootTableId = this.tableToRootTableCache.get(table.id)!;
            let gr = mergeGroups.get(rootTableId);
            if (gr) {
                gr.push(table.id);
                mergeGroups.set(rootTableId, gr);
            } else {
                gr = [];
                if (table.id != rootTableId) {
                    gr.push(table.id);
                }
                
                mergeGroups.set(rootTableId, gr);
            }
        }

        // commence merging tables!
        for (const [rootTableId, descendantTableIds] of mergeGroups) {
            const rootTable = this.tables.find(t => t.id == rootTableId);
            if (!rootTable) {
                continue;
            }

            // modify columns
            for (let i = 0; i < this.columns.length; i++) {
                const c = this.columns[i];
                if (descendantTableIds.includes(c.tableId)) {
                    // changing the owner of a column from the descendant table to the root table
                    const modified = new DbTableColumn({
                        ...c,
                        tableId: rootTableId
                    });
                    this.columns[i] = modified;
                }
            }

            // modify relations
            for (let i = 0; i < this.relations.length; i++) {
                const r = this.relations[i];
                if (descendantTableIds.includes(r.sourceTableId)) {
                    const modified = new DbTableRelation({
                        ...r,
                        targetTableId: rootTableId
                    });
                    this.relations[i] = modified;
                }
            }

            const discriminatorColumn = new DbTableColumn({
                tableId: rootTableId,
                name: rootTable.name + '_TYPE',
                type: 'INT',
                isPrimaryKey: false,
                isForeignKey: false,
                isUnique: false,
                isNullable: false
            });

            this.columns.push(discriminatorColumn);
        }
        
        // non-root tables are not needed anymore
        const nonRootTables = Array.from(mergeGroups.values()).flat();
        this.tables = this.tables.filter(t => !nonRootTables.includes(t.id));

        // Remove columns of removed tables
        this.columns = this.columns.filter(c => 
            this.tables.some(t => t.id === c.tableId)
        );
    }


    private processClassTableInheritance() {
        // For each table, create a foreign key reference to its root table
        for (const table of this.tables) {
            const rootTableId = this.tableToRootTableCache.get(table.id);
            if (rootTableId && rootTableId !== table.id) {
                const rootTable = this.tables.find(t => t.id === rootTableId);
                if (!rootTable) {
                    continue;
                }

                // Find primary key of root table
                const rootTablePk = this.columns.find(c => 
                    c.tableId === rootTableId && c.isPrimaryKey
                );
                if (!rootTablePk) {
                    console.warn('Table ' + rootTable.name + ' has no primary key despite being inherited from!');
                    continue;
                }

                // Create foreign key column in derived table
                const fkColumn = new DbTableColumn({
                    tableId: table.id,
                    name: rootTablePk.name,
                    type: rootTablePk.type,
                    isPrimaryKey: true,
                    isForeignKey: true,
                    isUnique: true,
                    isNullable: false,
                });

                // Create foreign key relationship
                const fkRelation = new DbTableRelation({
                    sourceTableId: rootTableId,
                    sourceColumnId: rootTablePk.id,
                    targetTableId: table.id,
                    targetColumnId: fkColumn.id,
                    kind: DbTableRelationKind.OneToOne
                });

                this.columns.push(fkColumn);
                this.relations.push(fkRelation);
            }
        }
    }

    private processConcreteTableInheritance() {
        // For each non-abstract table, gather columns from all its ancestors
        const processedTables = new Set<string>();

        const copyAncestorColumns = (tableId: string) => {
            if (processedTables.has(tableId)) {
                return;
            }
            
            const baseTableId = this.tableToBaseTableCache.get(tableId);
            if (baseTableId && baseTableId !== tableId) {
                // Process parent first
                copyAncestorColumns(baseTableId);
                
                // Copy columns from parent to current table
                const parentColumns = this.columns
                    .filter(c => c.tableId === baseTableId)
                    .map(c => new DbTableColumn({
                        ...c,
                        tableId: tableId
                    }));
                
                this.columns.push(...parentColumns);
            }

            processedTables.add(tableId);
        };

        for (const table of this.tables) {
            copyAncestorColumns(table.id);
        }
        
        // Only non-abstract tables should remain
        this.tables = this.tables.filter(t => !t.isAbstract);

        // Remove columns of removed tables
        this.columns = this.columns.filter(c => 
            this.tables.some(t => t.id === c.tableId)
        );
    }



    private processNNRelations() {
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
