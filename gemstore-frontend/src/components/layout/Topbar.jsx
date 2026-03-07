import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiSliders } from "react-icons/fi";
import "./Topbar.css";

const titles = {
  feed: "Explore Gemstones",
  sell: "List Your Gemstone",
  messages: "Messages",
  report: "Safety & Reports",
};

function Topbar({ activeTab, onSearch, onClearSearch, lookups }) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [filters, setFilters] = useState({
    gemstoneTypeId: "",
    colorId: "",
    originId: "",
    minPrice: "",
    maxPrice: "",
    minCarat: "",
    maxCarat: "",
    sortBy: "createdAt",
    sortDirection: "DESC",
  });

  const debounceRef = useRef(null);
  const filtersRef = useRef(null);
  const filterBtnRef = useRef(null);

  // Close filters dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        filtersRef.current && !filtersRef.current.contains(e.target) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  // Calculate dropdown position when opening
  const toggleFilters = () => {
    if (!showFilters && filterBtnRef.current) {
      const rect = filterBtnRef.current.getBoundingClientRect();
      const left = rect.right - 400;

      setDropdownPos({
        top: rect.bottom + 8,
        left: Math.max(16, left),
      });
    }
    setShowFilters(!showFilters);
  };

  // Build and emit search params
  const emitSearch = (searchQuery, searchFilters) => {
    const hasQuery = searchQuery && searchQuery.trim().length > 0;
    const hasFilters = Object.entries(searchFilters).some(
      ([key, val]) => val !== "" && key !== "sortBy" && key !== "sortDirection"
    );

    if (!hasQuery && !hasFilters) {
      if (onClearSearch) onClearSearch();
      return;
    }

    const params = {};
    if (hasQuery) params.query = searchQuery.trim();
    if (searchFilters.gemstoneTypeId) params.gemstoneTypeId = searchFilters.gemstoneTypeId;
    if (searchFilters.colorId) params.colorId = searchFilters.colorId;
    if (searchFilters.originId) params.originId = searchFilters.originId;
    if (searchFilters.minPrice) params.minPrice = searchFilters.minPrice;
    if (searchFilters.maxPrice) params.maxPrice = searchFilters.maxPrice;
    if (searchFilters.minCarat) params.minCarat = searchFilters.minCarat;
    if (searchFilters.maxCarat) params.maxCarat = searchFilters.maxCarat;
    params.sortBy = searchFilters.sortBy || "createdAt";
    params.sortDirection = searchFilters.sortDirection || "DESC";

    if (onSearch) onSearch(params, searchQuery.trim());
  };

  // Debounced text input
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emitSearch(value, filters);
    }, 400);
  };

  // Filter field change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters button
  const handleApplyFilters = () => {
    setShowFilters(false);
    emitSearch(query, filters);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      gemstoneTypeId: "",
      colorId: "",
      originId: "",
      minPrice: "",
      maxPrice: "",
      minCarat: "",
      maxCarat: "",
      sortBy: "createdAt",
      sortDirection: "DESC",
    };
    setFilters(resetFilters);
    setShowFilters(false);
    emitSearch(query, resetFilters);
  };

  // Clear everything
  const handleClear = () => {
    setQuery("");
    const resetFilters = {
      gemstoneTypeId: "",
      colorId: "",
      originId: "",
      minPrice: "",
      maxPrice: "",
      minCarat: "",
      maxCarat: "",
      sortBy: "createdAt",
      sortDirection: "DESC",
    };
    setFilters(resetFilters);
    if (onClearSearch) onClearSearch();
  };

  // Submit on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      emitSearch(query, filters);
    }
  };

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val !== "" && key !== "sortBy" && key !== "sortDirection"
  ).length;

  return (
    <header className="main-topbar">
      <h2 className="main-topbar-title">{titles[activeTab]}</h2>

      {activeTab === "feed" && (
        <div className="main-search-wrapper">
          <div className="main-search-box">
            <FiSearch className="main-search-icon" />
            <input
              className="main-search-input"
              placeholder="Search gems by type, color, origin, seller..."
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
            />
            {(query || activeFilterCount > 0) && (
              <button className="search-clear-btn" onClick={handleClear} title="Clear search">
                <FiX size={16} />
              </button>
            )}
            <button
              ref={filterBtnRef}
              className={`search-filter-btn ${activeFilterCount > 0 ? "has-filters" : ""}`}
              onClick={toggleFilters}
              title="Filters"
            >
              <FiSliders size={16} />
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div
              className="search-filters-dropdown"
              ref={filtersRef}
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
            >
              <div className="filters-header">
                <h4>Filter Results</h4>
                <button className="filters-reset-btn" onClick={handleResetFilters}>
                  Reset
                </button>
              </div>

              <div className="filters-grid">
                {/* Row 1: Gemstone Type | Color */}
                <div className="filter-field">
                  <label>Gemstone Type</label>
                  <select name="gemstoneTypeId" value={filters.gemstoneTypeId} onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    {lookups?.gemstoneTypes?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-field">
                  <label>Color</label>
                  <select name="colorId" value={filters.colorId} onChange={handleFilterChange}>
                    <option value="">All Colors</option>
                    {lookups?.colors?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Row 2: Origin | empty spacer */}
                <div className="filter-field">
                  <label>Origin</label>
                  <select name="originId" value={filters.originId} onChange={handleFilterChange}>
                    <option value="">All Origins</option>
                    {lookups?.origins?.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-field" />

                {/* Row 3: Min Price | Max Price */}
                <div className="filter-field">
                  <label>Min Price</label>
                  <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="e.g. 10000" min="0" />
                </div>
                <div className="filter-field">
                  <label>Max Price</label>
                  <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="e.g. 500000" min="0" />
                </div>

                {/* Row 4: Min Carat | Max Carat */}
                <div className="filter-field">
                  <label>Min Carat</label>
                  <input type="number" name="minCarat" value={filters.minCarat} onChange={handleFilterChange} placeholder="e.g. 1" min="0" step="0.1" />
                </div>
                <div className="filter-field">
                  <label>Max Carat</label>
                  <input type="number" name="maxCarat" value={filters.maxCarat} onChange={handleFilterChange} placeholder="e.g. 10" min="0" step="0.1" />
                </div>

                {/* Row 5: Sort By | Order */}
                <div className="filter-field">
                  <label>Sort By</label>
                  <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="createdAt">Newest</option>
                    <option value="price">Price</option>
                    <option value="caratWeight">Carat Weight</option>
                  </select>
                </div>
                <div className="filter-field">
                  <label>Order</label>
                  <select name="sortDirection" value={filters.sortDirection} onChange={handleFilterChange}>
                    <option value="DESC">High to Low</option>
                    <option value="ASC">Low to High</option>
                  </select>
                </div>
              </div>

              <div className="filters-actions">
                <button className="filters-apply-btn" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Topbar;