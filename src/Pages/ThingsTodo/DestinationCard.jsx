import {
  Badge,
  
  Box,
  
  Image,
  
} from '@chakra-ui/react';
import { formatCurrency, parsePrice } from "../../utils/currency";
import { Button } from "@chakra-ui/react";



export default function DestinationCard({image,title,price,rating,place,onAdd}){
  const property = {
    imageUrl: 'https://bit.ly/2Z4KKcF',
    imageAlt: 'Rear view of modern home with pool',
    beds: 3,
    baths: 2,
    title: 'Modern home in city center in the heart of historic Los Angeles',
    formattedPrice: '$1,900.00',
    reviewCount: 34,
    rating: 4,
  }

  return (
    <Box className="things-todo-card">
      <Image src={image} alt={title} />

      <Box className="things-todo-card-body">
        <Box display='flex' alignItems='baseline'>
          <Badge borderRadius='full' px='2' colorScheme='orange'>Featured</Badge>
          <Box
            color='gray.500'
            fontWeight='semibold'
            letterSpacing='wide'
            fontSize='xs'
            textTransform='uppercase'
            ml='2'
          >
            {property.beds} explore &bull; {property.baths} scenes
          </Box>
        </Box>

        <Box as='h3'>
          {title}
        </Box>

        <Box color="var(--coral)" fontWeight="700">
          {parsePrice(price) === 0 ? "Free" : formatCurrency(price)}
          <Box as='span' color='gray.600' fontSize='sm'>
            {parsePrice(price) === 0 ? "" : " / wk"}
          </Box>
        </Box>

        <Box display='flex' mt='2' alignItems='center'>
         
          <Box as='span' ml='2' color='gray.600' fontSize='sm'>
            {rating} reviews
          </Box>
          <Button className="accent-button" size="sm" onClick={onAdd}>Add to cart</Button>
        </Box>
      </Box>
    </Box>
  )
}