import React,{useState} from 'react'
import { AiTwotoneEnvironment } from "react-icons/ai";
import { Box, Button } from "@chakra-ui/react";
import { Link } from 'react-router-dom';



export const InputBox =()=>{
  
  const [placeName,setPlaceName] = useState("");

 

  
 

  return (
    <Box className="things-search">
      <h2 className="search-panel-title">Find things to do</h2>
      <div className="things-search-controls">
        <label className="things-city-field">
          <AiTwotoneEnvironment aria-hidden="true" />
          <span>Destination</span>
          <select value={placeName} onChange={(e)=>setPlaceName(e.target.value)} name="city">
            <option value="">Select a city</option>
        <option value="kolkata">Kolkata</option>
        <option value="delhi">Delhi</option>
        <option value="rajasthan">Rajasthan</option>
          </select>
        </label>
        <Button className="accent-button" borderRadius="6px" height="44px">
          <Link to={{ pathname: '/ThingsToDo', search: `?place=${placeName}` }}>Search</Link>
        </Button>
      </div>
    </Box>
      
       
       
    
    
   
  );
}
