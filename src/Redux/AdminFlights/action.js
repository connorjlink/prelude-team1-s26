import axios from "axios";
import {
  DELETE_FLIGHTS,
  FETCH_FLIGHTS,
  FLIGHT_FAILURE,
  FLIGHT_REQUEST,
  GET_FLIGHT_SUCCESS,
  POST_FLIGHT_SUCCESS,
  UPDATE_FLIGHT,
} from "./actionType";
import { flightService } from "../../01_firebase/firestore";

export const getFlightSuccess = (payload) => {
  return { type: GET_FLIGHT_SUCCESS, payload };
};

export const postFlightSuccess = (payload) => {
  return { type: POST_FLIGHT_SUCCESS };
};

export const flightRequest = () => {
  return { type: FLIGHT_REQUEST };
};

export const flightFailure = () => {
  return { type: FLIGHT_FAILURE };
};

//
export const fetch_flights_product = (payload) => {
  return { type: FETCH_FLIGHTS, payload };
};
//
export const handleDeleteProduct = (payload) => {
  return { type: DELETE_FLIGHTS, payload };
};

export const addFlight = (payload) => async (dispatch) => {
  dispatch(flightRequest());
  try {
    await flightService.create(payload);
    dispatch(postFlightSuccess());
  } catch (err) {
    axios
      .post("http://localhost:8080/flight", payload)
      .then(() => dispatch(postFlightSuccess()))
      .catch(() => dispatch(flightFailure()));
  }
};

//
export const fetchFlightProducts = (limit) => async (dispatch) => {
  dispatch(flightRequest());
  try {
    const data = await flightService.getAll(limit ? { limitN: limit } : {});
    dispatch(fetch_flights_product(data));
  } catch (err) {
    axios
      .get(limit ? `http://localhost:8080/flight?_limit=${limit}` : "http://localhost:8080/flight")
      .then((res) => dispatch(fetch_flights_product(res.data)))
      .catch(() => dispatch(flightFailure()));
  }
};

export const DeleteFlightProducts = (deleteId) => async (dispatch) => {
  try {
    await flightService.remove(deleteId);
    dispatch(handleDeleteProduct(deleteId));
  } catch (e) {
    try {
      await axios.delete(`http://localhost:8080/flight/${deleteId}`);
      dispatch(handleDeleteProduct(deleteId));
    } catch (err) {
      console.log(err);
    }
  }
};

export const updateFlight = (id, data) => async (dispatch) => {
  await flightService.update(id, data);
  dispatch({ type: UPDATE_FLIGHT, payload: { id, data } });
};
