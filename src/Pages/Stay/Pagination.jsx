import { fetchingHotels } from "../../Redux/StayReducer/action";
import { useDispatch } from "react-redux";


function Pagination({current, onChange, total}) {
  const dispatch = useDispatch();

  let btnArr = new Array(total).fill(0);
  return (
  <div data-testid = "page-container">
    {btnArr.map((ele, index) => {

      return (
        <button id="pagination"
        key={index + Math.random()}
        className={current === index + 1 ? "pagination-button is-active" : "pagination-button"}
        onClick={()=> {
          dispatch(fetchingHotels("", "",index+1));
          onChange(index +1)}}
        >
          {index +1}
        </button>
      )
    })}
  
  </div>
 
  );
}

export default Pagination;
