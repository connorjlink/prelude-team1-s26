import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteHotel, fetchingHotels } from "../../Redux/StayReducer/action";
import "./StayData.css";
import Sidebar from "./Sidebar";
import Pagination from "./Pagination";
import { formatCurrency, parsePrice } from "../../utils/currency";
import { Link } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { addCartItem } from "../../utils/cart";

const StayData = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const activeUser = useSelector((store) => store.LoginReducer.activeUser);
  const { data } = useSelector((store) => store.StayReducer);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 25000]);
  const [sortOptions, setSortOptions] = useState({ sort: "", order: "asc" });
  const pageSize = 20;

  const handlePriceRangeChange = (range) => {
    if (!Array.isArray(range) || range.length !== 2) return;
    const normalizedRange = range.map(Number);
    if (normalizedRange.every(Number.isFinite)) {
      setSelectedPriceRange(normalizedRange);
    }
  };

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const filteredHotel = useMemo(() => {
    const [minimumPrice, maximumPrice] = selectedPriceRange;
    const hotelsInRange = (data || []).filter((hotel) => {
      const price = Number(hotel.price);
      return Number.isFinite(price) && price >= minimumPrice && price <= maximumPrice;
    });

    if (!sortOptions.sort) return hotelsInRange;

    return [...hotelsInRange].sort((firstHotel, secondHotel) => {
      const firstValue = Number(firstHotel[sortOptions.sort]) || 0;
      const secondValue = Number(secondHotel[sortOptions.sort]) || 0;
      return (firstValue - secondValue) * (sortOptions.order === "desc" ? -1 : 1);
    });
  }, [data, selectedPriceRange, sortOptions]);
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
        item: { ...hotel, price: parsePrice(hotel.price) },
        nights: 1,
        totalPrice: parsePrice(hotel.price),
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
          (hotel) => {
            const p = parsePrice(hotel.price);
            return p >= selectedPriceRange[0] && p <= selectedPriceRange[1];
          }
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
        <Sidebar
          onSortChange={setSortOptions}
          onPriceRangeChange={handlePriceRangeChange}
        />
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
                  <p>{hotel.rating ? hotel.rating : 1}/5</p>
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