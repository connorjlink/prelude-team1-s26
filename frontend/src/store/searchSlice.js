import { createSlice } from '@reduxjs/toolkit'

const searchSlice = createSlice({
  name: 'search',
  initialState: { tripType: 'Round trip', destination: '' },
  reducers: {
    setTripType: (state, action) => { state.tripType = action.payload },
    setDestination: (state, action) => { state.destination = action.payload },
  },
})

export const { setTripType, setDestination } = searchSlice.actions
export default searchSlice.reducer
