import React from 'react'
import ItemsHome from '../components/ItemsHome'
import SEOHead from '../components/SEOHead'

const Home = () => {
  return (
    <>
      <SEOHead 
        title="Premium Shopping Experience"
        description="Shop the best products at RushBasket. Quality items, amazing prices, and fast delivery."
        keywords="premium shopping, online store, quality products, best deals"
      />
      <ItemsHome />
    </>
  )
}

export default Home