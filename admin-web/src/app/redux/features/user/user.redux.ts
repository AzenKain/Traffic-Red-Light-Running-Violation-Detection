
import { UserType } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialState = {
    value: UserType;
}

const initialState: InitialState = {
    value: {
        imgDisplay: "/images/user/user-06.png",
        details: undefined
    }
}

export const UserRedux = createSlice({
    name: 'UserRedux',
    initialState,
    reducers: {
        UpdateUser: (state, action: PayloadAction<UserType>) => {
            return {
                value: {
                    ...action.payload
                }
            }
        },

    }
})

export const { UpdateUser } = UserRedux.actions;

export default UserRedux.reducer;