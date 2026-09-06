import {
  SELECTED_DATE_AND_CITY,
  SELECTED_CITY,
  HOTEL_FAILURE,
  HOTEL_REQUEST,
  GET_HOTEL_SUCCESS,
  POST_HOTEL_SUCCESS,
  NEW_GET_HOTELS_SUCCESS,
  DELETE_HOTEL,
} from "./actionType";
import { hotelService } from "../../01_firebase/firestore";

export const getHotelSuccess = (payload) => {
  return { type: GET_HOTEL_SUCCESS, payload };
};

export const postHotelSuccess = (payload) => {
  return { type: POST_HOTEL_SUCCESS };
};

export const hotelRequest = () => {
  return { type: HOTEL_REQUEST };
};

export const hotelFailure = () => {
  return { type: HOTEL_FAILURE };
};

export const fetch_hotel = (payload) => {
  return { type: NEW_GET_HOTELS_SUCCESS, payload };
};

//
export const handleDeleteHotel = (payload) => {
  return { type: DELETE_HOTEL, payload };
};

//Pick date and city for storing into redux store

export const selectDateAndCity = (checkInDate,checkOutDate) => {
  return { type: SELECTED_DATE_AND_CITY, payload: { checkInDate, checkOutDate } };
};
export const selectCity = (selectedCity) => {
  return { type: SELECTED_CITY, payload: { selectedCity } };
};

export const addHotel = (payload) => async (dispatch) => {
  dispatch(hotelRequest());
  try {
    await hotelService.create(payload);
    dispatch(postHotelSuccess());
  } catch (err) {
    dispatch(hotelFailure());
    console.error("Unable to add hotel to Firestore.", err);
  }
};

// Load hotels from Firestore
export const fetchingHotels = (sort, order, page) => async (dispatch) => {
  dispatch({ type: HOTEL_REQUEST });
  try {
    const data = await hotelService.getAll({ orderByField: sort || "price", orderDir: order || "asc", limitN: 20 });
    // client-side pagination slice if page provided
    let paged = data;
    if (page) {
      const start = (page - 1) * 20;
      paged = data.slice(start, start + 20);
    }
    dispatch({ type: GET_HOTEL_SUCCESS, payload: paged });
  } catch (err) {
    dispatch({ type: HOTEL_FAILURE });
    console.error("Unable to load hotels from Firestore.", err);
  }
};

export const DeleteHotel = (deleteId) => async (dispatch) => {
  try {
    await hotelService.remove(deleteId);
    dispatch(handleDeleteHotel(deleteId));
  } catch (err) {
    console.error("Unable to delete hotel from Firestore.", err);
  }
};
