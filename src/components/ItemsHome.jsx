import React, { useEffect, useState } from "react";
import { itemsHomeStyles } from "../assets/dummyStyles";
import BannerHome from "./BannerHome";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { FaChevronRight, FaMinus, FaPlus, FaShoppingCart, FaThList } from "react-icons/fa";
import { categories } from "../assets/dummyData";
import productService from "../services/productService";
import { resolveImageSrc } from "../services/imageService";
import toast from 'react-hot-toast';

const ItemsHome = () => {
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem("activeCategory") || "All";
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("activeCategory", activeCategory);
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('[ItemsHome] Error fetching products:', error);
      toast.error('Failed to load products.');

      // Fallback to dummy data
      try {
        const { products: dummyProducts } = await import("../assets/dummyData");
        setProducts(dummyProducts);
      } catch (err) {
        console.error('[ItemsHome] Failed to load dummy data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleProductUpdate = () => fetchProducts();
    window.addEventListener('productUpdate', handleProductUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'productUpdate') fetchProducts();
    });

    return () => {
      window.removeEventListener('productUpdate', handleProductUpdate);
    };
  }, []);

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");

  const isSearching = searchTerm.trim() !== "";

  const productMatchesSearch = (product, term) => {
    if (!term) return true;
    const cleanTerm = term.trim().toLowerCase();
    const searchWords = cleanTerm.split(/\s+/);
    return searchWords.every((word) => product.name.toLowerCase().includes(word));
  };

  const searchedProducts = isSearching
    ? products.filter((product) => productMatchesSearch(product, searchTerm))
    : activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const getQuantity = (productId) => {
    const item = cart.find((ci) => ci.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleIncrease = (product) => {
    const productId = product._id || product.id;
    addToCart(productId, 1, product);
  };

  const handleDecrease = (product) => {
    const productId = product._id || product.id;
    const cartItem = cart.find((ci) => ci.productId === productId);
    const qty = cartItem ? cartItem.quantity : 0;
    if (qty > 1) {
      updateQuantity(cartItem.id, qty - 1);
    } else if (cartItem) {
      removeFromCart(cartItem.id);
    }
  };

  const redirectToItemsPage = () => {
    navigate("/items", { state: { category: activeCategory } });
  };

  const sidebarCategories = [
    { name: "All Items", icon: <FaThList className="text-lg" />, value: "All" },
    ...categories,
  ];

  return (
    <div className={itemsHomeStyles.page}>
      <BannerHome onSearch={setSearchTerm} />

      <div className="flex flex-col lg:flex-row flex-1">
        <aside className={itemsHomeStyles.sidebar}>
          <div className={itemsHomeStyles.sidebarHeader}>
            <h1 className={itemsHomeStyles.sidebarTitle} style={{ fontFamily: "'Playfair', serif" }}>RushBasket</h1>
            <div className={itemsHomeStyles.sectionDivider} />
          </div>

          <div className={itemsHomeStyles.categoryList}>
            <ul className="space-y-3">
              {sidebarCategories.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.value || category.name);
                      setSearchTerm("");
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

        <main className={itemsHomeStyles.mainContent}>
          <div className={itemsHomeStyles.mobileCategories}>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.value || cat.name);
                    setSearchTerm("");
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

          {isSearching && (
            <div className={itemsHomeStyles.searchResults}>
              <span className="text-emerald-700 font-medium">Search results for: <span className="font-bold">"{searchTerm}"</span></span>
              <button onClick={() => setSearchTerm("")} className="ml-4 text-emerald-500 bg-emerald-100 px-2 py-1 rounded-full text-sm">Clear</button>
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className={itemsHomeStyles.sectionTitle} style={{ fontFamily: "'Playfair', serif" }}>
              {isSearching ? "Search Results" : activeCategory === "All" ? "Featured Products" : `Best ${activeCategory}`}
            </h2>
            <div className={itemsHomeStyles.sectionDivider} />
          </div>

          <div className={itemsHomeStyles.productsGrid}>
            {searchedProducts.length > 0 ? (
              searchedProducts.map((product) => {
                const productId = product._id || product.id;
                const qty = getQuantity(productId);
                return (
                  <div key={productId} className={itemsHomeStyles.productCard}>
                    <div className={itemsHomeStyles.imageContainer}>
                      <img
                        src={resolveImageSrc(product.image || product.imageUrl) || "https://placehold.co/300x200?text=No+Image"}
                        alt={product.name}
                        className={itemsHomeStyles.productImage}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200?text=Error"; }}
                      />
                    </div>
                    <div className={itemsHomeStyles.productContent}>
                      <h3 className={itemsHomeStyles.productTitle}>{product.name}</h3>
                      <div className={itemsHomeStyles.priceContainer}>
                        <div>
                          <p className={itemsHomeStyles.currentPrice}>${product.price.toFixed(2)}</p>
                          {product.oldPrice && <span className={itemsHomeStyles.oldPrice}>${product.oldPrice.toFixed(2)}</span>}
                        </div>
                        {qty === 0 ? (
                          <button onClick={() => handleIncrease(product)} className={itemsHomeStyles.addButton}><FaShoppingCart className="mr-2" />Add</button>
                        ) : (
                          <div className={itemsHomeStyles.quantityControls}>
                            <button onClick={() => handleDecrease(product)} className={itemsHomeStyles.quantityButton}><FaMinus /></button>
                            <span className="font-bold">{qty}</span>
                            <button onClick={() => handleIncrease(product)} className={itemsHomeStyles.quantityButton}><FaPlus /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={itemsHomeStyles.noProducts}>No Products Found</div>
            )}
          </div>

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