import { Backend_URL } from "./Constants";
import { addProductDto } from "./dtos/product/addProduct.dto";
import { deleteProductDto } from "./dtos/product/deleteProduct.dto";
import { editProductDto } from "./dtos/product/editProduct.dto";

async function refreshTokenApi(refreshToken: string): Promise<string | null> {
    try {
        const response = await fetch(Backend_URL + "/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${refreshToken}`
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data?.access_token;
        } else {
            console.error("Failed to refresh access token:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Error while refreshing access token:", error);
        return null;
    }
}

export async function makeRequestApi(callback: Function, dto: any, refreshToken: string | undefined, accessToken: string | undefined) {
    try {
        if (accessToken == undefined) return null;
        const data = await callback(dto, accessToken);
        
        if (data == null && refreshToken !== undefined) {
            const newAccessToken = await refreshTokenApi(refreshToken);

            if (newAccessToken) {
                return await callback(dto, newAccessToken);
            } else {
                console.log('Unauthorized!');
                return null;
            }
        } else {
            return data;
        }
    } catch (error) {
        console.log(error);
    }
}

export async function addProductApi(dto: addProductDto, accessToken: string) {
    const res = await fetch(Backend_URL + "/camera/create", {
        method: "POST",
        body: JSON.stringify({
            ...dto
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}

export async function editProductApi(dto: editProductDto, accessToken: string) {
    const res = await fetch(Backend_URL + `/camera/update/${dto.productId}`, {
        method: "PUT",
        body: JSON.stringify({
            ...dto
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}

export async function genKeyProductApi(dto: editProductDto, accessToken: string) {
    const res = await fetch(Backend_URL + `/camera/key/${dto.productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}


export async function deleteProductApi(dto: deleteProductDto, accessToken: string) {
    const res = await fetch(Backend_URL + `/camera/delete/${dto.productId}`, {
        method: "DELETE",
        body: JSON.stringify({
            ...dto
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}

export async function getAllProductApi(idx: null, accessToken: string) {
    const res = await fetch(Backend_URL + "/camera/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });

    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}


export async function getProductByIdApi(productId: string, accessToken: string) {
    const res = await fetch(Backend_URL + `/camera/id/${productId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}

export async function getUserDetailApi(idx : null, accessToken: string) {
    const res = await fetch(Backend_URL + `/auth/detail`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
    });
    if (res.status == 401) {
        console.log(res.statusText);
        return null;
    }
    const data = await res.json()
    return data;
}
