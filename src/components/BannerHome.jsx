import React, { useState } from 'react'
import { bannerStyles } from '../assets/dummyStyles'
import { FiSearch, FiTruck } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { features } from '../assets/Dummy'

// Use public/ path so the <link rel="preload"> in index.html works on the same URL
const BANNER_IMG = '/FoodBanner.png'

const BannerHome = ({ onSearch }) => {

    const [searchTrem, setSearchTrem] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => setSearchTrem(e.target.value)

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimedTrim = searchTrem.trim();

        if (trimedTrim) {
            if (onSearch) {
                const searchWords = trimedTrim.toLowerCase().split(/\s+/)
                onSearch(searchWords.join(' '))
            }
            else {
                navigate(`/items?search=${encodeURIComponent(trimedTrim)}`)
            }
            searchTrem(' ')
        }
    }
    return (
        <div className=' relative overflow-hidden pt-16'>
            {/* bg gradiant */}
            <div className={bannerStyles.backgroundGradient}></div>
            {/* Decorative circles */}
            <div className="hidden sm:block absolute top-6 left-6 w-20 h-20 rounded-full bg-teal-100 opacity-30"></div>
            <div className="hidden md:block absolute bottom-12 right-28 w-32 h-32 rounded-full bg-seafoam-200 opacity-30"></div>
            <div className="hidden lg:block absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-mint-200 opacity-30"></div>

            <div className=' relative z-10 mt-8 sm:mt-10 lg:mt-12 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16'>
                <div className=' grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-center'>

                    {/* left content */}
                    <div className=' text-center md:text-left'>
                        <div className={bannerStyles.tag}>
                            <span className=' flex items-center text-sm sm:text-base'>
                                <FiTruck className=' mr-2' /> Free delivery on orders over 500
                            </span>
                        </div>
                        <h1 className={bannerStyles.heading}>
                            Fresh{' '}
                            <span className={bannerStyles.headingItalic}>
                                Groceries
                            </span>
                            <br /> Delivered to Your Door
                        </h1>
                        <p className={bannerStyles.paragraph}>
                            Discover the freshest produce, top-quality meats, and pantry essentials-all
                            delivered witin 30 minutes
                        </p>


                        <form onSubmit={handleSubmit} className={bannerStyles.form}>
                            <input type="text" value={searchTrem} onChange={handleSearch}
                                placeholder='Search for fruits, vegetables, meats, dairy...'
                                className={bannerStyles.input}
                            />
                            <button type='submit' className={bannerStyles.searchButton}>
                                <FiSearch className=' h-4 w-4 sm:h-5 sm:w-5' />
                            </button>
                        </form>

                        <div className=' grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                            {features.map((f, i) => (
                                <div key={i} className={bannerStyles.featureItem}>
                                    <div className=' text-teal-600 mb-1'>{f.icon}</div>
                                    <span className={bannerStyles.featureText}>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* right image */}
                    <div className=' relative flex justify-center'>
                        <div className={bannerStyles.imageContainer}>
                            <div className={bannerStyles.imageInner}>
                                <img
                                  src={BANNER_IMG}
                                  alt="Fresh groceries delivered to your door"
                                  className=' object-cover w-full h-full'
                                  width={600}
                                  height={500}
                                  fetchpriority="high"
                                  decoding="async"
                                />
                            </div>
                        </div>

                        <div className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 rounded-full bg-mint-200 opacity-20"></div>
                        <div className="hidden md:block absolute -bottom-4 -left-4 w-28 h-28 rounded-full bg-teal-100 opacity-20"></div>
                        <div className="hidden lg:block absolute top-1/4 -left-6 w-20 h-20 rounded-full bg-seafoam-100 opacity-20"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BannerHome