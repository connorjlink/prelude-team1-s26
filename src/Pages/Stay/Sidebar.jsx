import React from "react";
import { useSearchParams } from "react-router-dom";
import PriceSlider from "./PriceSlider";

export const Sidebar = ({
  onSortChange = () => {},
  onPriceRangeChange = () => {},
}) => {
 const [, setSearchParams] = useSearchParams();

 const handleSortChange = (sort, order) => {
   setSearchParams({ _sort: sort, _order: order });
   onSortChange({ sort, order });
 };

  return (
    <div className="stay-filter">
      <h3>Sort and filter</h3>
      <div className="stay-filter-group">
        <h4>Price</h4>
        <input
          type="radio"
          name="price"
          value="asc"
          onChange={() => handleSortChange("price", "asc")}
        />
        <label>Low to High</label>
        <br />
        <input
          type="radio"
          name="price"
          value="desc"
          onChange={() => handleSortChange("price", "desc")}
        />
        <label>High to Low</label>
      </div>
      <br />
      <br />
      <div className="stay-filter-group">
        <h4>Rating</h4>
        <input
          type="radio"
          name="rating"
          value="asc"
          onChange={() => handleSortChange("rating", "asc")}
        />
        <label>Low to High</label>
        <br />
        <input
          type="radio"
          name="rating"
          value="desc"
          onChange={() => handleSortChange("rating", "desc")}
        />
        <label>High to Low</label>
      </div>
      <br/>
      <br/>
      <br/>
      <div>
        <PriceSlider onPriceRangeChange={onPriceRangeChange} />
      </div>
    </div>
  );
};

export default Sidebar;
