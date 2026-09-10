import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shoes: [],
  totalAmount: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addShoesToCart: (state, action) => {
      state.shoes.push(action.payload);
      state.totalAmount += action.payload.price;
    },
    removeShoesFromCart: (state, action) => {
      const line = state.shoes.find((shoe) => shoe.id === action.payload.id);
      if (!line) return;
      state.totalAmount -= line.price * line.quantity;
      state.shoes = state.shoes.filter((shoe) => shoe.id !== line.id);
    },
    increaseQuantity: (state, action) => {
      const line = state.shoes.find((shoe) => shoe.id === action.payload.id);
      if (!line) return;
      line.quantity += 1;
      state.totalAmount += line.price;
    },
    decreaseQuantity: (state, action) => {
      const line = state.shoes.find((shoe) => shoe.id === action.payload.id);
      if (!line || line.quantity <= 1) return;
      line.quantity -= 1;
      state.totalAmount -= line.price;
    },
  },
});

export const {
  addShoesToCart,
  removeShoesFromCart,
  increaseQuantity,
  decreaseQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;
