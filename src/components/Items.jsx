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
import { Link, useLocation, useNavigate } from "react-router-dom";
import productService from "../services/productService";
import { resolveImageSrc } from "../services/imageService";
import OptimizedImage from './OptimizedImage';

const ProductCard = ({ item }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const productId = item._id || item.id;

  const cartItem = cart.find(ci => ci.productId === productId);
  const lineId = cartItem?.id;
  const quantity = cartItem?.quantity || 0;
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (loading) return;
    setLoading(true);
    try { 
      await addToCart(productId, 1, item); 
    } finally { 
      setLoading(true); // Keep loading state briefly for UX
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleIncrement = async () => {
    if (loading || !lineId) return;
    setLoading(true);
    try { await updateQuantity(lineId, quantity + 1); }
    finally { setLoading(false); }
  };

  const handleDecrement = async () => {
    if (loading || !lineId) return;
    setLoading(true);
    try {
      if (quantity <= 1) await removeFromCart(lineId);
      else await updateQuantity(lineId, quantity - 1);
    } finally { setLoading(false); }
  };

  const imgSrc = resolveImageSrc(item.image || item.imageUrl);

  return (
    <div className={itemsPageStyles.productCard}>
      <div className={itemsPageStyles.imageContainer}>
        <OptimizedImage
          src={imgSrc || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={item.name}
          className={itemsPageStyles.productImage}
          width={300}
          height={200}
        />
      </div>

      <div className={itemsPageStyles.cardContent}>
        <div className={itemsPageStyles.titleContainer}>
          <h3 className={itemsPageStyles.productTitle}>{item.name}</h3>
          <span className={itemsPageStyles.organicTag}>{item.category || 'Organic'}</span>
        </div>
        <p className={itemsPageStyles.productDescription}>
          {item.description || `Fresh organic ${item.name.toLowerCase()} sourced locally`}
        </p>

        <div className={itemsPageStyles.priceContainer}>
          <span className={itemsPageStyles.currentPrice}>${item.price.toFixed(2)}</span>
          {item.oldPrice && item.oldPrice > item.price && (
            <span className={itemsPageStyles.oldPrice}>${item.oldPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="mt-4">
          {quantity > 0 ? (
            <div className={itemsPageStyles.quantityControls}>
              <button onClick={handleDecrement} disabled={loading} className={itemsPageStyles.quantityButton}><FiMinus /></button>
              <span className={itemsPageStyles.quantityValue}>{quantity}</span>
              <button onClick={handleIncrement} disabled={loading} className={itemsPageStyles.quantityButton}><FiPlus /></button>
            </div>
          ) : (
            <button onClick={handleAddToCart} disabled={loading} className={itemsPageStyles.addButton}>
              <span>{loading ? 'Adding...' : 'Add to cart'}</span>
              <span className={itemsPageStyles.addButtonArrow}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Items = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get("search");
    if (search) setSearchTerm(search);
  }, [location]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const products = await productService.getProducts();
      
      const grouped = products.reduce((acc, item) => {
        const cat = item.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = { id: cat, name: cat, items: [] };
        acc[cat].items.push(item);
        return acc;
      }, {});
      
      setData(Object.values(grouped));
    } catch (err) {
      console.error('[Items] Fetching error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredData = searchTerm
    ? data.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : data;

  return (
    <div className={itemsPageStyles.page}>
      <div className={itemsPageStyles.container}>
        <header className={itemsPageStyles.header}>
          <Link to="/" className={`${itemsPageStyles.backLink} mt-12 inline-flex items-center`}><FiArrowLeft className="mr-2" /> Back</Link>
          <h1 className={itemsPageStyles.mainTitle}><span className={itemsPageStyles.titleSpan}>RUSH</span> BASKET</h1>
          <p className={itemsPageStyles.subtitle}>Premium quality groceries sourced from local organic farms</p>
          <div className={itemsPageStyles.titleDivider}><div className={itemsPageStyles.dividerLine} /></div>
        </header>

        <div className={itemsPageStyles.searchContainer}>
          <div className={itemsPageStyles.searchForm}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fruits, vegetables, meats..."
              className={itemsPageStyles.searchInput}
            />
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex justify-center mt-6 mb-10">
            <button onClick={() => setAllExpanded(!allExpanded)} className={itemsPageStyles.expandButton}>
              <span className="mr-2 font-medium">{allExpanded ? "Collapse All" : "Expand All"}</span>
              {allExpanded ? <FiMinus /> : <FiPlus />}
            </button>
          </div>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading products...</div>
          ) : filteredData.length > 0 ? (
            filteredData.map((category) => {
              const isExpanded = expandedCategories[category.id] || allExpanded;
              const visibleItems = isExpanded ? category.items : category.items.slice(0, 4);
              const hasMoreItems = category.items.length > 4;

              return (
                <section key={category.id} className={itemsPageStyles.categorySection}>
                  <div className={itemsPageStyles.categoryHeader}>
                    <h2 className={itemsPageStyles.categoryTitle}>{category.name}</h2>
                    <div className={itemsPageStyles.categoryDivider}></div>
                  </div>
                  <div className={itemsPageStyles.productsGrid}>
                    {visibleItems.map((item) => (
                      <ProductCard key={item._id || item.id} item={item} />
                    ))}
                  </div>
                  {hasMoreItems && (
                    <div className="mt-10 flex justify-center">
                      <button 
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                        className={itemsPageStyles.showMoreButton}
                      >
                        {isExpanded ? `Show Less` : `Show More (${category.items.length - 4}+)`}
                      </button>
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
              <FiSearch className="mx-auto h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">No Products Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;