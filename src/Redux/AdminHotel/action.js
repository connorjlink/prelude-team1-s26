import axios from "axios";
import {
  HOTEL_FAILURE,
  HOTEL_REQUEST,
  GET_HOTEL_SUCCESS,
  POST_HOTEL_SUCCESS,
  NEW_GET_HOTELS_SUCCESS,
  DELETE_HOTEL,
  UPDATE_HOTEL,
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

//

export const addHotel = (payload) => async (dispatch) => {
  dispatch(hotelRequest());
  try {
    await hotelService.create(payload);
    dispatch(postHotelSuccess());
  } catch (err) {
    // fallback to json-server
    axios
      .post("http://localhost:8080/hotel", payload)
      .then(() => dispatch(postHotelSuccess()))
      .catch(() => dispatch(hotelFailure()));
  }
};

export const fetchingHotels = (limit) => async (dispatch) => {
  try {
    const data = await hotelService.getAll(limit ? { limitN: limit } : {});
    dispatch(fetch_hotel(data));
  } catch (err) {
    axios
      .get(limit ? `http://localhost:8080/hotel?_limit=${limit}` : "http://localhost:8080/hotel")
      .then((res) => dispatch(fetch_hotel(res.data)))
      .catch((e) => console.log(e));
  }
};

export const DeleteHotel = (deleteId) => async (dispatch) => {
  try {
    await hotelService.remove(deleteId);
    dispatch(handleDeleteHotel(deleteId));
  } catch (e) {
    // fallback
    try {
      const res = await fetch(`http://localhost:8080/hotel/${deleteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      // DELETE on json-server may return empty body; guard JSON parse
      const text = await res.text();
      if (text) {
        try { JSON.parse(text); } catch (_) {}
      }
      dispatch(handleDeleteHotel(deleteId));
    } catch (err) {
      console.log(err);
    }
  }
};

export const updateHotel = (id, data) => async (dispatch) => {
  await hotelService.update(id, data);
  dispatch({ type: UPDATE_HOTEL, payload: { id, data } });
};
