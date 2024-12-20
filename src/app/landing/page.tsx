import Background from '@/components/Background'
import CustomScroll from '@/components/CustomScroll'
import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import React from 'react'

const Page = () => {
  return (
    <>
      <Navbar />
      <Background />
      <Hero />
      <CustomScroll />
    </>
  )
}

export default Page