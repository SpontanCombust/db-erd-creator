import type DesignDtoMapper from "./DesignDtoMapper";
import type DbDesignDto from "@/dto/DbDesignDto";
import type DesignManagerService from "./DesignManagerService";

export default class JsonImportExportService {
    private dtoMapper: DesignDtoMapper;
    private designManager: DesignManagerService;

    constructor(dtoMapper: DesignDtoMapper, designManager: DesignManagerService) {
        this.dtoMapper = dtoMapper;
        this.designManager = designManager;
    }


    exportCurrentDesignToJson() : string {
        const design = this.designManager.assembleCurrentDesign();
        const designDto = this.dtoMapper.mapDesignModelToDto(design);
        const json = JSON.stringify(designDto);
        return json;
    }

    importDesignFromJson(json: string) {
        const designDto: DbDesignDto = JSON.parse(json);
        const design = this.dtoMapper.mapDesignDtoToModel(designDto);
        this.designManager.loadDesign(design);
    } 
}