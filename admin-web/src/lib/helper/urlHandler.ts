import { param } from "jquery";

export type encodeDto = {
    name ?: string,
    brand ?: string[],
    concentration ?: string[],
    sex ?: string[],
    size ?: string[],
    count ?: number,
    page ?: number,
    rangeMoney ?: number[],
    fragranceNotes?: string[],
    sort?: string,
    hotSales?: string,
}

export function encodeParams(params: encodeDto): string {
    const queryParams: string[] = [];
    if (params.name) { queryParams.push(`name=${params.name}`) }
    if (params.brand?.length) { queryParams.push(`brand=${params.brand.join("_")}`) }
    if (params.concentration?.length) { queryParams.push(`concentration=${params.concentration.join("_")}`) }
    if (params.sex?.length) { queryParams.push(`sex=${params.sex.join("_")}`) }
    if (params.size?.length) { queryParams.push(`size=${params.size.join("_")}`) }
    if (params.count) { queryParams.push(`count=${params.count}`) }
    if (params.page) { queryParams.push(`page=${params.page}`) }
    if (params.rangeMoney?.length) { queryParams.push(`rangeMoney=${params.rangeMoney.join("_")}`) }
    if (params.fragranceNotes?.length) { queryParams.push(`fragranceNotes=${params.fragranceNotes.join("_")}`) }
    if (params.sort) { queryParams.push(`sort=${params.sort}`) }
    if (params.hotSales) { queryParams.push(`page=${params.hotSales}`) }
    return `?${queryParams.join("&")}`;
}

export function decodeParams(params: {
    name?: string;
    brand?: string;
    concentration?: string;
    sex?: string;
    size?: string;
    count?: string;
    page?: string;
    rangeMoney?: string;
    fragranceNotes?: string;
    sort?: string,
    hotSales?: string
}): {
    name?: string;
    brand?: string[];
    concentration?: string[];
    sex?: string[];
    size?: string[];
    count?: number;
    page?: number;
    rangeMoney?: [number, number];
    fragranceNotes?: string[];
    sort?: string,
    hotSales?: string
} {
    return {
        name: params.name ? params.name : undefined,
        brand: params.brand ? params.brand.split('_') : undefined,
        concentration: params.concentration ? params.concentration.split('_') : undefined,
        sex: params.sex ? params.sex.split('_') : undefined,
        size: params.size ? params.size.split('_') : undefined,
        count: params.count ? Number(params.count) : undefined,
        page: params.page ? Number(params.page) : undefined,
        rangeMoney: params.rangeMoney ? params.rangeMoney.split('_').map(Number) as [number, number] : undefined,
        fragranceNotes: params.fragranceNotes ? params.fragranceNotes.split('_') : undefined,
        sort: params.sort ? params.sort : undefined,
        hotSales: params.hotSales ? params.page : undefined,
    };
}
