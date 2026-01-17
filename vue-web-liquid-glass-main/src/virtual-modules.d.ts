// Type declarations for virtual modules
declare module "virtual:refractionDisplacementMap*" {
    export const url: string;
    export const maxDisplacement: number;
    const data: {
        url: string;
        maxDisplacement: number;
    };
    export default data;
}

declare module "virtual:refractionSpecularMap*" {
    const url: string;
    export default url;
}

declare module "virtual:refractionFilter*" {
    import type { Component } from "vue";

    interface FilterProps {
        id: string;
        withSvgWrapper?: boolean;
        blur?: number;
        scaleRatio?: number;
        specularOpacity?: number;
        specularSaturation?: number;
        magnifyingScale?: number;
        width?: number;
        height?: number;
    }

    export const Filter: Component<FilterProps>;
    export default Filter;
}
