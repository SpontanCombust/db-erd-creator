import { executeDbQuery, executeDbSelectQuery } from '@/api/tauri'
import type DesignManagerService from './DesignManagerService';
import type DesignDtoMapper from './DesignDtoMapper';
import type DbDesignDto from '@/dto/DbDesignDto';


// A single record table holding the current database design data
const DB_TABLE_NAME = '__DB_ERD_CREATOR_DESIGN';

export default class DesignPersistenceService {
    constructor(
        private readonly designManager: DesignManagerService,
        private readonly dtoMapper: DesignDtoMapper
    ) {

    }


    public async saveCurrentDesignToDatabase() {
        if (!await this.wasDatabasePersistenceInitialized()) {
            await this.initializeDatabasePersistence();
        }

        const design = this.designManager.assembleCurrentDesign();
        const designDto = this.dtoMapper.mapDesignModelToDto(design);
        const designJson = JSON.stringify(designDto);
        const designDate = new Date().toUTCString();
        
        const q = `
            UPDATE ${DB_TABLE_NAME} SET
                DESIGN_JSON = '${designJson}',
                DESIGN_DATE = '${designDate}';
        `;

        const res = await executeDbQuery(q);
        console.log('Changes saved!');
        console.log(res);
    }

    public async loadCurrentDesignFromDatabase() {
        if (!await this.wasDatabasePersistenceInitialized()) {
            return;
        }

        const q = `
            SELECT DESIGN_JSON FROM ${DB_TABLE_NAME};
        `;

        const res = await executeDbSelectQuery(q);
        const designDto: DbDesignDto = JSON.parse(res.records[0][0]);
        const design = this.dtoMapper.mapDesignDtoToModel(designDto);
        this.designManager.loadDesign(design);

        console.log('Design loaded!');
    }


    private async wasDatabasePersistenceInitialized() : Promise<boolean> {
        try {
            // if it errors, there probably is no design table in the database yet
            const res = await executeDbQuery(`SELECT CREATOR_VERSION FROM ${DB_TABLE_NAME};`);
            console.log('Last design save date: ');
            console.log(res);
            return true;
        } catch (err: any) {
            console.log('Database is uninitialized');
            console.log(err);
            return false;
        }
    }

    private async initializeDatabasePersistence() {
        const q = `
            CREATE TABLE ${DB_TABLE_NAME}(
                CREATOR_VERSION INT,
                DESIGN_JSON TEXT,
                DESIGN_DATE TEXT
            );
            INSERT INTO ${DB_TABLE_NAME} (CREATOR_VERSION, DESIGN_JSON, DESIGN_DATE)
                VALUES ('${__APP_VERSION__}', '', '');
        `;

        try {
            const res = await executeDbQuery(q);
            console.log('Initialized database persistence!');
            console.log(res);
        } catch (err: any) {
            console.error('Failed to initialize database persistence!');
            console.error(err);
            throw err;
        }
    }
}