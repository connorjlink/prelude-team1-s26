import React, { useState } from "react";
import "./PriceSlider.css";
import { formatCurrency } from "../../utils/currency";

const MIN_PRICE = 0;
const MAX_PRICE = 25000;

const PriceSlider = ({ onPriceRangeChange = () => {} }) => {
 const [sliderValues, setSliderValues] = useState({
   min: MIN_PRICE,
   max: MAX_PRICE,
 });

  const handleSliderChange = (event) => {
    const { name, value } = event.target;
    const nextValue = Number(value);
    const nextValues = {
      min: name === "min" ? Math.min(nextValue, sliderValues.max) : sliderValues.min,
      max: name === "max" ? Math.max(nextValue, sliderValues.min) : sliderValues.max,
    };
    setSliderValues(nextValues);
    onPriceRangeChange([nextValues.min, nextValues.max]);
  };

  const formatSliderValue = (value) => formatCurrency(value);

  
  return (
    <div className="price-range-slider">
      <div
        className="range-bar"
      >
        <div className="slider">
          <p>Minimum Price</p>
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            name="min"
            value={sliderValues.min}
            onChange={handleSliderChange}
            className="slider-input"
          />
          <span className="slider-value">
            {formatSliderValue(sliderValues.min)}
          </span>
        </div>
        <div className="slider">
          <p>Maximum Price</p>
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            name="max"
            value={sliderValues.max}
            onChange={handleSliderChange}
            className="slider-input"
          />
          <span className="slider-value">
            {formatSliderValue(sliderValues.max)}
          </span>
        </div>
      </div>
      <p className="range-text">
        <input
          type="text"
          value={`${formatSliderValue(sliderValues.min)} - ${formatSliderValue(
            sliderValues.max
          )}`}
          readOnly
          className="range-text-input"
        />
      </p>
    </div>
  );
};

export default PriceSlider;
