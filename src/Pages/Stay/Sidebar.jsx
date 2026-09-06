import React from "react";
import { useSearchParams } from "react-router-dom";
import { fetchingHotels } from "../../Redux/StayReducer/action";
import { useDispatch } from "react-redux";
import PriceSlider from "./PriceSlider";

export const Sidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [order,setOrder] = React.useState("asc");
  const [sort,setSort] = React.useState("");
  const dispatch = useDispatch();

const handlePriceChange = (e) => {
  const selectedOrder = e.target.value;
  const selectedSort = "price";
  setOrder(selectedOrder);
  setSort(selectedSort);
};
 
  const handleRatingChange = (e) => {
    // setOrder(e.target.value);
    const selectedOrder = e.target.value;
    const selectedSort = "rating";
    setOrder(selectedOrder);
    setSort(selectedSort);
  };

  React.useEffect(() => {
    let params = {};
    sort && (params["_sort"] = sort);
    order && (params["_order"] = order);
    setSearchParams(params);

    dispatch(fetchingHotels(sort, order,));
  }, [sort, order]);

  return (
    <div className="stay-filter">
      <h3>Sort and filter</h3>
      <div className="stay-filter-group" onChange={handlePriceChange} >
        <h4>Price</h4>
        <input
          type="radio"
          name="price"
          value={"asc"}
         
        />
        <label>Low to High</label>
        <br />
        <input
          type="radio"
          name="price"
          value={"desc"}
          
        />
        <label>High to Low</label>
      </div>
      <br />
      <br />
      <div className="stay-filter-group" onChange={handleRatingChange}>
        <h4>Rating</h4>
        <input
          type="radio"
          name="rating"
          value={"asc"}
         
        />
        <label>Low to High</label>
        <br />
        <input
          type="radio"
          name="rating"
          value={"desc"}
          
        />
        <label>High to Low</label>
      </div>
      <br/>
      <br/>
      <br/>
      <div>
        <PriceSlider />
      </div>
    </div>
  );
};

export default Sidebar;
