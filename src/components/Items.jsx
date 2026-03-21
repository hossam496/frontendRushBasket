import React, { useEffect, useState } from "react";
import { useCart } from "../CartContext";
import { itemsPageStyles } from "../assets/dummyStyles";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiMinus,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { data, Link, useLocation, useNavigate } from "react-router-dom";
import { groceryData } from "../assets/dummyDataItem";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Product Card Component
const ProductCard = ({ item }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const productId = item._id

  const cartItem = cart.find(ci => ci.productId === productId);
  const lineId = cartItem?.id
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(productId, 1, { name: item.name, price: item.price, imageUrl: rawImage });
  };

  const handleIncement = () => {
    updateQuantity(lineId, quantity + 1)
  };

  const handleDecrement = () => {
    if (quantity <= 1) removeFromCart(lineId)
    else updateQuantity(lineId, quantity - 1)
  };

  const rawImage = item.image || item.imageUrl
  let imgSrc = item.image
  if (rawImage) {
    if (rawImage.startsWith('http')) imgSrc = rawImage
    else if (rawImage.startsWith('/')) imgSrc = `${BACKEND_URL}${rawImage}`
    else imgSrc = `${BACKEND_URL}/uploads/${rawImage}`
  }

  return (
    <div className={itemsPageStyles.productCard}>
      <div className={itemsPageStyles.imageContainer}>
        <img
          src={imgSrc}
          alt={item.name}
          className={itemsPageStyles.productImage}
        />
      </div>

      <div className={itemsPageStyles.cardContent}>
        <div className={itemsPageStyles.titleContainer}>
          <h3 className={itemsPageStyles.productTitle}>{item.name}</h3>
          <span className={itemsPageStyles.organicTag}>Organic</span>
        </div>
        <p className={itemsPageStyles.productDescription}>
          {item.description ||
            `Fresh organic ${item.name.toLowerCase()} sourced locally`}
        </p>

        <div className={itemsPageStyles.priceContainer}>
          <span className={itemsPageStyles.currentPrice}>
            ${item.price.toFixed(2)}
          </span>
          <span className={itemsPageStyles.oldPrice}>
            ${(item.price * 1.2).toFixed(2)}
          </span>
        </div>

        <div className="mt-4">
          {quantity > 0 ? (
            <div className={itemsPageStyles.quantityControls}>
              <button
                onClick={handleDecrement}
                className={`${itemsPageStyles.quantityButton} ${itemsPageStyles.quantityButtonLeft}`}
              >
                <FiMinus />
              </button>
              <span className={itemsPageStyles.quantityValue}>{quantity}</span>
              <button
                onClick={handleIncement}
                className={`${itemsPageStyles.quantityButton} ${itemsPageStyles.quantityButtonRight}`}
              >
                <FiPlus />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={itemsPageStyles.addButton}
            >
              <span>Add to cart</span>
              <span className={itemsPageStyles.addButtonArrow}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Items Component
const Items = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [data, setData] = useState(groceryData)

  // Sync search term with URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get("search");
    if (search) {
      setSearchTerm(search)
    }
  }, [location]);

  // featch from backend side
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/items`)
      .then(res => {
        const products = Array.isArray(res.data)
          ? res.data
          : res.data.products || []

        const grouped = products.reduce((acc, item) => {
          const cat = item.category || "Uncategorized"
          if (!acc[cat]) acc[cat] = { id: cat, name: cat, items: [] }
          acc[cat].items.push(item)
          return acc
        }, {})
        setData(Object.values(grouped))
      })
      .catch(err => console.error('Fetching error:', err))
  }, [])

  const itemMatchesSearch = (item, term) => {
    if (!term) return true;
    const cleanTerm = term.trim().toLowerCase();
    const searchWords = cleanTerm.split(/\s+/);
    return searchWords.every((word) => item.name.toLowerCase().includes(word));
  };

  const filteredData = searchTerm
    ? data
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          itemMatchesSearch(item, searchTerm),
        ),
      }))
      .filter((category) => category.items.length > 0)
    : data;

  const clearSearch = () => {
    setSearchTerm("");
    navigate("/items");
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleAllCategories = () => {
    if (allExpanded) {
      setExpandedCategories({});
    } else {
      const expanded = {};
      data.forEach((category) => {
        expanded[category.id] = true;
      });
      setExpandedCategories(expanded);
    }
    setAllExpanded(!allExpanded);
  };

  return (
    <div className={itemsPageStyles.page}>
      <div className={itemsPageStyles.container}>
        {/* Header Section */}
        <header className={itemsPageStyles.header}>
          <Link
            to="/"
            className={`${itemsPageStyles.backLink} mt-12 md:mt-20 lg:mt-10 inline-flex items-center`}
          >
            <FiArrowLeft className="mr-2" />
            <span>Back</span>
          </Link>

          <h1 className={itemsPageStyles.mainTitle}>
            <span className={itemsPageStyles.titleSpan}>ORGANIC</span> PANTRY
          </h1>

          <p className={itemsPageStyles.subtitle}>
            Premium quality groceries sourced from local organic farms
          </p>

          <div className={itemsPageStyles.titleDivider}>
            <div className={itemsPageStyles.dividerLine} />
          </div>
        </header>

        {/* Search and Global Controls */}
        <div className={itemsPageStyles.searchContainer}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
              }
            }}
            className={itemsPageStyles.searchForm}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fruits, vegetables, meats..."
              className={itemsPageStyles.searchInput}
            />
            <button type="submit" className={itemsPageStyles.searchButton}>
              <FiSearch className="h-5 w-5" />
            </button>
          </form>

          <div className="flex justify-center mt-6 mb-10">
            <button
              onClick={toggleAllCategories}
              className={itemsPageStyles.expandButton}
            >
              <span className="mr-2 font-medium">
                {allExpanded ? "Collapse All" : "Expand All"}
              </span>
              {allExpanded ? (
                <FiMinus className="text-lg" />
              ) : (
                <FiPlus className="text-lg" />
              )}
            </button>
          </div>
        </div>

        {/* Products Display Section */}
        <div className="w-full">
          {filteredData.length > 0 ? (
            filteredData.map((category) => {
              const isExpanded = expandedCategories[category.id] || allExpanded;
              const visibleItems = isExpanded
                ? category.items
                : category.items.slice(0, 4);
              const hasMoreItems = category.items.length > 4;

              return (
                <section
                  key={category.id}
                  className={itemsPageStyles.categorySection}
                >
                  <div className={itemsPageStyles.categoryHeader}>
                    <div className={itemsPageStyles.categoryIcon}></div>
                    <h2 className={itemsPageStyles.categoryTitle}>
                      {category.name}
                    </h2>
                    <div className={itemsPageStyles.categoryDivider}></div>
                  </div>

                  {/* Grid Container */}
                  <div className={itemsPageStyles.productsGrid}>
                    {visibleItems.map((item) => (
                      <ProductCard key={item._id} item={item} />
                    ))}
                  </div>

                  {hasMoreItems && (
                    <div className="mt-10 flex justify-center">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={itemsPageStyles.showMoreButton}
                      >
                        <span className="mr-2 font-medium">
                          {isExpanded
                            ? `Show Less ${category.name}`
                            : `Show More ${category.name} (${category.items.length - 4}+)`}
                        </span>
                        {isExpanded ? (
                          <FiChevronUp className="text-lg" />
                        ) : (
                          <FiChevronDown className="text-lg" />
                        )}
                      </button>
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            <div className={itemsPageStyles.noProductsContainer}>
              <div className={itemsPageStyles.noProductsCard}>
                <div className={itemsPageStyles.noProductsIcon}>
                  <FiSearch className="mx-auto h-16 w-16" />
                </div>
                <h3 className={itemsPageStyles.noProductsTitle}>
                  No Products Found
                </h3>
                <p className={itemsPageStyles.noProductsText}>
                  We couldn’t find any items matching "{searchTerm}"
                </p>
                <button
                  onClick={clearSearch}
                  className={itemsPageStyles.clearSearchButton}
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;