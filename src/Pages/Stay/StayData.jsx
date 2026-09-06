import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteHotel } from "../../Redux/StayReducer/action";
import "./StayData.css";
import Sidebar from "./Sidebar";
import Pagination from "./Pagination";
import { formatCurrency } from "../../utils/currency";

const StayData = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.StayReducer);
  const [selectedPriceRange] = useState([0, 10000]);
  const [filteredHotel, setFilteredHotel] = useState([]);

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalNumOfPages = Math.ceil(244 / 20); 


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLeft = (id) => {
    dispatch(DeleteHotel(id));
  };

  // useEffect(() => {
  //   dispatch(fetchingHotels("","",""));
  // }, [dispatch]);

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

  return (
    <div className="stay-data">
      <div className="sidebar-container">
       <Sidebar/>
      </div>

      <div className="stay-results">
       {filteredHotel?.map((hotel) => (
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
  );
};

export default StayData;