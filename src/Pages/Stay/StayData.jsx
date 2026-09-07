import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteHotel, fetchingHotels } from "../../Redux/StayReducer/action";
import "./StayData.css";
import Sidebar from "./Sidebar";
import Pagination from "./Pagination";
import { formatCurrency } from "../../utils/currency";
import { Link } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { addCartItem } from "../../utils/cart";

const StayData = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const activeUser = useSelector((store) => store.LoginReducer.activeUser);
  const { data } = useSelector((store) => store.StayReducer);
  const [selectedPriceRange] = useState([0, 10000]);
  const [filteredHotel, setFilteredHotel] = useState([]);
  const pageSize = 20;

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalNumOfPages = Math.max(1, Math.ceil(filteredHotel.length / pageSize));


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLeft = (id) => {
    dispatch(DeleteHotel(id));
  };

  const handleAddToCart = async (hotel) => {
    try {
      await addCartItem(activeUser, {
        type: "hotel",
        itemId: hotel.id,
        title: hotel.name,
        item: hotel,
        nights: 1,
        totalPrice: Number(hotel.price) || 0,
      });
      toast({ title: "Stay added to cart", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Unable to add stay", description: error.message, status: "error", duration: 4000, isClosable: true });
    }
  };

  // useEffect(() => {
  //   dispatch(fetchingHotels("","",""));
  // }, [dispatch]);

  useEffect(() => {
    dispatch(fetchingHotels("", "", ""));
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setFilteredHotel(
        data.filter(
          (hotel) =>
            hotel.price >= selectedPriceRange[0] &&
            hotel.price <= selectedPriceRange[1]
        )
      );
    }
  }, [data, selectedPriceRange]);

  useEffect(() => {
    if (currentPage > totalNumOfPages) setCurrentPage(totalNumOfPages);
  }, [currentPage, totalNumOfPages]);

  const visibleHotels = filteredHotel.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="stay-data">
      <div className="catalog-heading">
        <div>
          <span className="eyebrow">Prelude collections</span>
          <h1>Stays</h1>
          <p>Find a comfortable place to stay on your journey.</p>
        </div>
        <Link className="catalog-action" to="/">New search</Link>
      </div>
      <div className="stay-catalog-content">
       <div className="sidebar-container">
        <Sidebar/>
       </div>

       <div className="stay-results">
        {visibleHotels.map((hotel) => (
          <div className="stay-card" key={hotel.id}>
            <img src={hotel.image} alt={hotel.name} />
            <div className="stay-info">
              <div className="stay-header">
                <h3 className="stay-name">{hotel.name}</h3>
                <button className="stay-left-btn" onClick={() => handleLeft(hotel.id)}>
                  We have 5 left
                </button>
              </div>
              <p className="stay-location">{hotel.location}</p>
              <p className="stay-description">{hotel.description}</p>
              <div className="stay-details">
                <div className="stay-price">
                  <span>Price per night</span>
                  <p>{formatCurrency(hotel.price)}</p>
                </div>
                <div className="stay-rating">
                  <span>Rating</span>
                  <p>{hotel.rating ? hotel.rating : 1}/10</p>
                </div>
              </div>
              <button className="catalog-action stay-cart-button" type="button" onClick={() => handleAddToCart(hotel)}>
                Add to cart
              </button>
            </div>
          </div>
         ))}
        </div>
        <div className="stay-pagination">
        <Pagination
          current={currentPage}
          onChange={handlePageChange}
          total={totalNumOfPages}
        />
        </div>
      </div>
    </div>
  );
};

export default StayData;