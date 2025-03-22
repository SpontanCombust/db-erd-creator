import DesignerState from "@/model/DesignerState";

import { inject, provide } from "vue";


const KEY = 'DESIGNER_STATE';

export function provideDesignerState(state: DesignerState) {
    return provide(KEY, state);
}

export function useDesignerState() {
    return inject(KEY, new DesignerState());
}