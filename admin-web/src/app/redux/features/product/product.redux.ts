import { Camera } from '@/types/product';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialState = {
    value: Camera[];
    tmpValue: Camera[];
}

const initialState: InitialState = {
    value: [],
    tmpValue: [],
}

export const ProductRedux = createSlice({
    name: 'ProductRedux',
    initialState,
    reducers: {
        RemoveProduct: (state, action: PayloadAction<string>) => {
            state.value = state.value.filter(it => it._id !== action.payload);
            state.tmpValue = state.tmpValue.filter(it => it._id !== action.payload);
        },
        AddProduct: (state, action: PayloadAction<Camera>) => {
            let indexValue = state.value.findIndex(it => it._id === action.payload._id)
            if (indexValue !== -1) {
                let newProductList = [...state.value];
                newProductList[indexValue] = action.payload;
                state.value = newProductList
            }
            else {
                let newProductList = [...state.value, action.payload]
                state.value = newProductList
            }
            let indexValue2 = state.tmpValue.findIndex(it => it._id === action.payload._id)
            if (indexValue2 !== -1) {
                state.tmpValue[indexValue2] = action.payload
            }
            else {
                state.tmpValue.push(action.payload)
            }
        },
        AddListProduct: (state, action: PayloadAction<Camera[]>) => {
            let newProductList = [...action.payload]
            state.value = newProductList
            state.tmpValue = newProductList
        },
        SearchProduct: (state, action: PayloadAction<{value: string, filter: string}>) => {
            if (action.payload.filter == 'all') {
                state.value = state.tmpValue;
            }
            else if (action.payload.filter == "_id") {
                state.value = state.tmpValue.filter(it => it._id?.toLowerCase().includes(action.payload.value.toLowerCase()));
            }
            else if (action.payload.filter == "address") {
                state.value = state.tmpValue.filter(it => it.address?.toLowerCase().includes(action.payload.value.toLowerCase()));
            }
        }
    }
})

export const { RemoveProduct, AddProduct, AddListProduct, SearchProduct} = ProductRedux.actions;

export default ProductRedux.reducer;