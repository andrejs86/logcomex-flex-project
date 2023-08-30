import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface IReasonModalState {
  isOpen: boolean;
}

const initialState = {
  isOpen: false,
} as IReasonModalState;

const slice = createSlice({
  name: 'reasonModalState',
  initialState,
  reducers: {
    setReasonModalIsOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
  },
});

export const { setReasonModalIsOpen } = slice.actions;
export const reducerHook = () => ({ reasonModalState: slice.reducer });
