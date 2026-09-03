import { useSelector, useDispatch } from 'react-redux'
import { Plane, Search, MapPin, CalendarDays, UserRound, ShoppingBag } from 'lucide-react'
import { setTripType, setDestination } from './store/searchSlice'
import './App.css'

const featuredTrips = [
  { city: 'Lisbon', country: 'Portugal', price: '$489', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80' },
  { city: 'Kyoto', country: 'Japan', price: '$1,024', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
  { city: 'Reykjavik', country: 'Iceland', price: '$734', image: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?auto=format&fit=crop&w=800&q=80' },
]

function App() {
  const dispatch = useDispatch()
  const { tripType, destination } = useSelector((state) => state.search)

  return (
    <div className="app-shell">
      <footer><span>&copy; 2026 Prelude</span><span>CPRE/SE 3290, Team 1 (Connor Link, Connor Moroney, Alec Moore, Chris Lopez) - Dr. Gaffar.</span></footer>
    </div>
  )
}

export default App
