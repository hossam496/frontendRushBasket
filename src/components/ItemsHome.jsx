import React, { useEffect, useState } from "react";
import { itemsHomeStyles } from "../assets/dummyStyles";
import BannerHome from "./BannerHome";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { FaChevronRight, FaMinus, FaPlus, FaShoppingCart, FaThList } from "react-icons/fa";
import { categories, products } from "../assets/dummyData";

const ItemsHome = () => {
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem("activeCategory") || "All";
  });

  useEffect(() => {
    localStorage.setItem("activeCategory", activeCategory);
  }, [activeCategory]);

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [searchTerm, setSearchTerm] = useState(""); // ← مهم: فارغ مش مسافة

  // تحديد إذا كان في بحث حقيقي أم لا
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
    const item = cart.find((ci) => ci.id === productId);
    return item ? item.quantity : 0;
  };

  const handleIncrease = (product) => addToCart(product, 1);

  const handleDecrease = (product) => {
    const qty = getQuantity(product.id);
    if (qty > 1) updateQuantity(product.id, qty - 1);
    else removeFromCart(product.id);
  };

  const redirectToItemsPage = () => {
    navigate("/items", { state: { category: activeCategory } });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // sidebar categories
  const sidebarCategories = [
    {
      name: "All Items",
      icon: <FaThList className="text-lg" />,
      value: "All",
    },
    ...categories,
  ];

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
              FreshCart
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
                    className={`${itemsHomeStyles.categoryItem} ${
                      activeCategory === (category.value || category.name) && !isSearching
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
                  className={`${itemsHomeStyles.mobileCategoryItem} ${
                    activeCategory === (cat.value || cat.name) && !isSearching
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
            {searchedProducts.length > 0 ? (
              searchedProducts.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <div key={product.id} className={itemsHomeStyles.productCard}>
                    <div className={itemsHomeStyles.imageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={itemsHomeStyles.productImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.png"; // أو رسالة No Image
                        }}
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

                        {/* هنا الجزء المهم: الكنترولز بتظهر دلوقتي */}
                        {qty === 0 ? (
                          <button
                            onClick={() => handleIncrease(product)}
                            className={itemsHomeStyles.addButton}
                          >
                            <FaShoppingCart className="mr-2" />
                            Add
                          </button>
                        ) : (
                          <div className={itemsHomeStyles.quantityControls}>
                            <button
                              onClick={() => handleDecrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaMinus />
                            </button>
                            <span className="font-bold">{qty}</span>
                            <button
                              onClick={() => handleIncrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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