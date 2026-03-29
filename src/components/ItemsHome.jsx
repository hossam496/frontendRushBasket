import React, { useEffect, useState, useMemo, useCallback } from "react";
import { itemsHomeStyles } from "../assets/dummyStyles";
import BannerHome from "./BannerHome";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { FaChevronRight, FaMinus, FaPlus, FaShoppingCart, FaThList } from "react-icons/fa";
import { categories } from "../assets/dummyData";
import api, { API_BASE_URL } from '../services/api';
import { ProductCardSkeleton } from './UI/LoadingStates';

// Memoized Product Card component
const ProductCard = React.memo(({ product, quantity, onIncrease, onDecrease }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionFn) => {
    if (loading) return;
    setLoading(true);
    try {
      await actionFn(product);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400?text=No+Image";
  };

  return (
    <div className={itemsHomeStyles.productCard}>
      <div className={itemsHomeStyles.imageContainer}>
        <img
          src={resolveImageSrc(product.imageUrl)}
          alt={product.name}
          className={itemsHomeStyles.productImage}
          width={300}
          height={200}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      </div>
      <div className={itemsHomeStyles.productContent}>
        <h3 className={itemsHomeStyles.productTitle}>{product.name}</h3>
        <div className={itemsHomeStyles.priceContainer}>
          <div>
            <p className={itemsHomeStyles.currentPrice}>
              {product.price.toFixed(2)}
            </p>
            <span className={itemsHomeStyles.oldPrice}>
              {(product.price * 1.2).toFixed(2)}
            </span>
          </div>

          {quantity === 0 ? (
            <button
              onClick={() => handleAction(onIncrease)}
              disabled={loading}
              className={`${itemsHomeStyles.addButton} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaShoppingCart className="mr-2" />
              {loading ? 'Adding...' : 'Add'}
            </button>
          ) : (
            <div className={itemsHomeStyles.quantityControls}>
              <button
                onClick={() => handleAction(onDecrease)}
                disabled={loading}
                className={`${itemsHomeStyles.quantityButton} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <FaMinus aria-hidden="true" />
              </button>
              <span className="font-bold">{quantity}</span>
              <button
                onClick={() => handleAction(onIncrease)}
                disabled={loading}
                className={`${itemsHomeStyles.quantityButton} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={`Increase quantity of ${product.name}`}
              >
                <FaPlus aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const ItemsHome = () => {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem("activeCategory") || "All";
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("activeCategory", activeCategory);
  }, [activeCategory]);

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[ItemsHome] Fetching products from:', `${API_BASE_URL}/api/items`);
        const res = await api.get('/api/items');

        // Safety check: Ensure res.data is an array
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);

        if (!Array.isArray(data)) {
          console.error('[ItemsHome] Invalid products data format:', res.data);
          setProducts([]);
          return;
        }

        const normalized = data.map((p) => ({
          ...p,
          id: p._id,
        }));
        setProducts(normalized);
      } catch (err) {
        console.error('[ItemsHome] Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts()
  }, [])

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");

  const isSearching = useMemo(() => searchTerm.trim() !== "", [searchTerm]);

  const searchedProducts = useMemo(() => {
    const productMatchesSearch = (product, term) => {
      if (!term) return true;
      const cleanTerm = term.trim().toLowerCase();
      const searchWords = cleanTerm.split(/\s+/);
      return searchWords.every((word) => product.name.toLowerCase().includes(word));
    };

    return isSearching
      ? products.filter((product) => productMatchesSearch(product, searchTerm))
      : activeCategory === "All"
        ? products
        : products.filter((product) => product.category === activeCategory);
  }, [products, isSearching, searchTerm, activeCategory]);

  const sidebarCategories = useMemo(() => [
    {
      name: "All Items",
      icon: <FaThList className="text-lg" />,
      value: "All",
    },
    ...categories,
  ], []);

  const getQuantity = useCallback((productId) => {
    const item = cart.find((ci) => ci.productId === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  const getLineItemId = useCallback((productId) => {
    const item = cart.find((ci) => ci.productId === productId)
    return item ? item.id : null
  }, [cart]);

  // Memoized handlers
  const handleIncrease = useCallback(async (product) => {
    const lineId = getLineItemId(product._id)
    if (lineId) {
      await updateQuantity(lineId, getQuantity(product._id) + 1)
    }
    else {
      await addToCart(product._id, 1, { name: product.name, price: product.price, imageUrl: product.imageUrl })
    }
  }, [addToCart, updateQuantity, getQuantity, getLineItemId])

  const handleDecrease = useCallback(async (product) => {
    const qty = getQuantity(product._id);
    const lineId = getLineItemId(product._id)
    if (qty > 1 && lineId) await updateQuantity(lineId, qty - 1);
    else if (lineId) await removeFromCart(lineId);
  }, [updateQuantity, removeFromCart, getQuantity, getLineItemId])

  const redirectToItemsPage = useCallback(() => {
    navigate("/items", { state: { category: activeCategory } });
  }, [navigate, activeCategory]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  return (
    <div className={itemsHomeStyles.page}>
      <BannerHome onSearch={handleSearch} />

      <div className="flex flex-col lg:flex-row flex-1">
        <aside className={itemsHomeStyles.sidebar}>
          <div className={itemsHomeStyles.sidebarHeader}>
            <h1
              style={{
                fontFamily: "'Playfair', serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
              className={itemsHomeStyles.sidebarTitle}
            >
              FlashBasket
            </h1>
            <div className={itemsHomeStyles.sectionDivider} />
          </div>

          <div className={itemsHomeStyles.categoryList}>
            <ul className="space-y-3">
              {sidebarCategories.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.value || category.name);
                      setSearchTerm(""); // reset search
                    }}
                    className={`${itemsHomeStyles.categoryItem} ${activeCategory === (category.value || category.name) && !isSearching
                        ? itemsHomeStyles.activeCategory
                        : itemsHomeStyles.inactiveCategory
                      }`}
                  >
                    <div className={itemsHomeStyles.categoryIcon}>{category.icon}</div>
                    <span className={itemsHomeStyles.categoryName}>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* main content */}
        <main className={itemsHomeStyles.mainContent}>
          {/* mobile category scroll */}
          <div className={itemsHomeStyles.mobileCategories}>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.value || cat.name);
                    setSearchTerm(""); // reset search
                  }}
                  className={`${itemsHomeStyles.mobileCategoryItem} ${activeCategory === (cat.value || cat.name) && !isSearching
                      ? itemsHomeStyles.activeMobileCategory
                      : itemsHomeStyles.inactiveMobileCategory
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* search result header */}
          {isSearching && (
            <div className={itemsHomeStyles.searchResults}>
              <div className="flex items-center justify-center">
                <span className="text-emerald-700 font-medium">
                  Search results for: <span className="font-bold">"{searchTerm}"</span>
                </span>
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-4 text-emerald-500 hover:text-emerald-700 p-1 rounded-full transition-colors"
                >
                  <span className="text-sm bg-emerald-100 px-2 py-1 rounded-full">Clear</span>
                </button>
              </div>
            </div>
          )}

          {/* section title */}
          <div className="text-center mb-6">
            <h2
              className={itemsHomeStyles.sectionTitle}
              style={{ fontFamily: "'Playfair', serif" }}
            >
              {isSearching
                ? "Search Results"
                : activeCategory === "All"
                  ? "Featured Products"
                  : `Best ${activeCategory}`}
            </h2>
            <div className={itemsHomeStyles.sectionDivider} />
          </div>

          {/* product grid */}
          <div className={itemsHomeStyles.productsGrid}>
            {loading ? (
              // Skeleton cards prevent CLS: grid has fixed dimensions before real data arrives
              Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : error ? (
              <div className="col-span-full py-20 text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : searchedProducts.length > 0 ? (
              searchedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getQuantity(product.id)}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              ))
            ) : (
              <div className={itemsHomeStyles.noProducts}>
                <div className={itemsHomeStyles.noProductsText}>No Products Found</div>
                {isSearching && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={itemsHomeStyles.clearSearchButton}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* view all button */}
          {!isSearching && (
            <div className="text-center mt-8">
              <button onClick={redirectToItemsPage} className={itemsHomeStyles.viewAllButton}>
                View All {activeCategory === "All" ? "Products" : activeCategory}
                <FaChevronRight className="ml-3" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ItemsHome;