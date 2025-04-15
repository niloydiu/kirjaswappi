import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { assets } from "./assets/assets";
import Header from "./components/Header";

// Simple API configuration
const API_ENDPOINT =
  "https://api.jsonsilo.com/42bdd7bb-7066-49e8-ae50-bee747b7aa5c";

// Cache key for local storage
const CACHE_KEY = "book_data_cache";
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  // State to track which books are kept/saved
  const [savedBooks, setSavedBooks] = useState({});
  // State to track if description is expanded
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // Track if description is actually overflowing
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    useState(false);
  const descriptionRef = useRef(null);

  // Sample user's other books data
  const userOtherBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3AUFCwmu_j2CBIbvuqUgrB1Qq1iHVIJKTTg&s",
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg",
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      image:
        "https://m.media-amazon.com/images/I/61NAx5pd6XL._AC_UF894,1000_QL80_.jpg",
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvO4uiNMI93sV94VNhNkPq8PQ8wtvvadLQCw&s",
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      image:
        "https://www.art-prints-on-demand.com/kunst/unbekannter_kuenstler/Titelseite-des-Buches-Der-Faenger-im-Roggen-von-J-D-Salinger.jpg",
    },
    {
      id: 6,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      image:
        "https://i.etsystatic.com/17937725/r/il/c080e6/5942302806/il_1588xN.5942302806_nzmp.jpg",
    },
  ];

  // Function to toggle description expansion
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Function to toggle saved state of a book
  const toggleSaveBook = (bookIndex) => {
    setSavedBooks((prev) => ({
      ...prev,
      [bookIndex]: !prev[bookIndex],
    }));
  };

  // Check cache for valid data
  const getDataFromCache = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();

      // Check if cache is still valid
      if (now - timestamp < CACHE_EXPIRY) {
        return data;
      }

      // Cache expired
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  // Store data in cache
  const saveDataToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  // Simple function to fetch data from API
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = getDataFromCache();
        if (cachedData) {
          setData(cachedData);
          return;
        }
      }

      // Don't set loading state if data already exists (for refreshes)
      if (!forceRefresh) setLoading(true);
      setError(null);

      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await axios.get(API_ENDPOINT, {
          headers: {
            "X-SILO-KEY": "3akimClnEXEa0AgAeuQtNqsf1Q6Bb38oTzkvv2keBa",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          // Prevent caching by the browser
          params: forceRefresh ? { _t: new Date().getTime() } : {},
        });

        clearTimeout(timeoutId);

        // Handle response data more efficiently
        let bookData = response.data;
        if (response.data.data !== undefined) {
          bookData = response.data.data;
        }

        // Skip expensive console logging in production
        if (import.meta.env.MODE !== "production") {
          console.log("API Response received");
        }

        // Check if bookData has the expected structure
        if (!bookData || typeof bookData !== "object") {
          throw new Error("Invalid data format received from API");
        }

        // Save to cache (even on force refresh)
        saveDataToCache(bookData);

        setData(bookData);
      } catch (error) {
        // Handle specific error for aborted requests
        if (error.name === "AbortError") {
          console.error("Request timed out:", error);
          setError("Request timed out. Please try again.");
        } else {
          console.error("Failed to load data:", error);
          setError("Could not load book data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [] // Keep empty dependency array
  );

  // Force refresh function for manual refresh
  const forceRefresh = () => {
    fetchData(true);
  };

  // Simple retry function
  const retryFetch = () => {
    fetchData(false);
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchData();
  }, [fetchData]);

  // Simple horizontal scroll function
  const handleScroll = (e) => {
    if (scrollContainerRef.current) {
      // Add horizontal scrolling with mouse wheel
      if (e.shiftKey || e.deltaX === 0) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Function to check if description is overflowing
  const checkDescriptionOverflow = useCallback(() => {
    if (descriptionRef.current) {
      const element = descriptionRef.current;
      setIsDescriptionOverflowing(
        element.scrollHeight > element.clientHeight ||
          element.offsetHeight < element.scrollHeight
      );
    }
  }, []);

  // Effect to check description overflow whenever data changes
  useEffect(() => {
    if (data && data.description) {
      // Wait for render to complete
      setTimeout(checkDescriptionOverflow, 100);
    }
  }, [data, checkDescriptionOverflow]);

  // Re-check overflow when window is resized
  useEffect(() => {
    window.addEventListener("resize", checkDescriptionOverflow);
    return () => window.removeEventListener("resize", checkDescriptionOverflow);
  }, [checkDescriptionOverflow]);

  // Function to render swap conditions based on the condition type
  const renderSwapConditions = () => {
    if (!data || loading) return null;

    // Check if swapCondition exists
    if (!data.swapCondition) {
      console.error("No swap condition found in data:", data);
      return (
        <div className="bg-[#dee7f5] px-2 py-4 flex gap-3 min-w-[340px] w-[340px] min-h-[112px] sm:w-72 flex-shrink-0 rounded-lg md:flex-shrink-0">
          <div className="w-full flex justify-center items-center">
            <p className="text-xs font-normal">
              No exchange conditions available
            </p>
          </div>
        </div>
      );
    }

    const { swapCondition } = data;
    // Check if conditionType exists
    if (!swapCondition.conditionType) {
      console.error(
        "No condition type found in swap condition:",
        swapCondition
      );
      return (
        <div className="bg-[#dee7f5] px-2 py-4 flex gap-3 min-w-[340px] w-[340px] min-h-[112px] sm:w-72 flex-shrink-0 rounded-lg md:flex-shrink-0">
          <div className="w-full flex justify-center items-center">
            <p className="text-xs font-normal">Unknown exchange condition</p>
          </div>
        </div>
      );
    }

    const { conditionType } = swapCondition;

    // Render different content based on conditionType
    switch (conditionType) {
      case "ByBooks": {
        // Check if there's only one book or multiple books
        const hasMultipleBooks =
          swapCondition.swappableBooks &&
          swapCondition.swappableBooks.length > 1;
        const bookCardWidth = hasMultipleBooks
          ? "min-w-[200px] w-[200px]"
          : "min-w-[340px] w-[340px]";

        return (
          <>
            {swapCondition.swappableBooks &&
              swapCondition.swappableBooks.map((book, index) => (
                <div
                  key={index}
                  className={`bg-[#dee7f5] px-2 py-4 flex gap-3 ${bookCardWidth} min-h-[112px] sm:w-72 flex-shrink-0 rounded-lg md:flex-shrink-0`}
                >
                  <div className="w-1/3 flex justify-end items-center">
                    <img
                      src={savedBooks[index] ? assets.exchange : assets.save}
                      alt={savedBooks[index] ? "Book Kept" : "Keep This Book"}
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent events
                        toggleSaveBook(index);
                      }}
                    />
                  </div>
                  <div className="w-2/3 flex flex-col justify-center gap-1">
                    <h1 className="max-w-32 text-xs font-normal font-poppins leading-[18px] text-left line-clamp-2">
                      {book.title}
                    </h1>
                    <h1 className="max-w-32 text-xs font-light font-poppins leading-[18px] text-left line-clamp-2">
                      By {book.author}
                    </h1>
                  </div>
                </div>
              ))}
          </>
        );
      }

      case "ByGenres": {
        // Check if there's only one genre or multiple genres
        const hasMultipleGenres =
          swapCondition.swappableGenres &&
          swapCondition.swappableGenres.length > 1;
        const genreCardWidth = hasMultipleGenres
          ? "min-w-[200px] w-[200px]"
          : "min-w-[340px] w-[340px]";

        return (
          <>
            {swapCondition.swappableGenres &&
              swapCondition.swappableGenres.map((genre, index) => (
                <div
                  key={index}
                  className={`bg-[#dee7f5] px-2 py-4 flex gap-3 ${genreCardWidth} min-h-[112px] sm:w-72 flex-shrink-0 rounded-lg md:flex-shrink-0`}
                >
                  <div className="w-1/3 flex justify-end items-center">
                    <img
                      src={
                        savedBooks[`genre-${index}`]
                          ? assets.exchange
                          : assets.save
                      }
                      alt={
                        savedBooks[`genre-${index}`]
                          ? "Genre Kept"
                          : "Keep This Genre"
                      }
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveBook(`genre-${index}`);
                      }}
                    />
                  </div>
                  <div className="w-2/3 flex flex-col justify-center gap-1">
                    <h1 className="max-w-32 text-xs font-normal font-poppins leading-[18px] text-left line-clamp-2">
                      {genre}
                    </h1>
                    <h1 className="max-w-32 text-xs font-light font-poppins leading-[18px] text-left line-clamp-2">
                      Genre preference
                    </h1>
                  </div>
                </div>
              ))}
          </>
        );
      }

      case "OpenForOffers": {
        // OpenForOffers is always a single card, so use the larger width
        return (
          <div className="bg-[#dee7f5] px-2 py-4 flex gap-3 min-w-[340px] w-[340px] min-h-[112px] sm:w-72 flex-shrink-0 rounded-lg md:flex-shrink-0">
            <div className="w-1/3 flex justify-end items-center">
              <img
                src={savedBooks["open-offers"] ? assets.exchange : assets.save}
                alt={
                  savedBooks["open-offers"] ? "Offer Kept" : "Keep This Offer"
                }
                className="h-8 w-8 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveBook("open-offers");
                }}
              />
            </div>
            <div className="w-2/3 flex flex-col justify-center gap-1">
              <h1 className="max-w-32 text-xs font-normal font-poppins leading-[18px] text-left line-clamp-2">
                Open to Offer
              </h1>
              <h1 className="max-w-32 text-xs font-light font-poppins leading-[18px] text-left line-clamp-2">
                Flexible exchange
              </h1>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Function to render book information with progressive loading
  const renderBookInfo = () => {
    if (error && !data) {
      return (
        <div className="w-full text-center p-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={retryFetch}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="w-full text-center gap-1">
        {loading && !data ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-[18px] bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        ) : (
          <>
            <p className="leading-6 text-base font-medium font-poppins mb-2">
              {data?.title || "Title unavailable"}
            </p>
            <p className="font-normal text-sm leading-5 font-poppins mb-2">
              {data?.author ? `by ${data.author}` : "Author unavailable"}
            </p>
            <div className="flex flex-wrap justify-center">
              {data?.genres && data.genres.length > 0 ? (
                data.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs font-light leading-[18px] font-poppins inline-block"
                  >
                    {genre}
                    {index < data.genres.length - 1 ? " | " : ""}
                  </span>
                ))
              ) : (
                <span className="text-xs font-light leading-[18px] font-poppins">
                  No genres available
                </span>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Function to render book condition info with skeleton loading
  const renderBookConditionInfo = () => {
    if (loading && !data) {
      return (
        <div className="animate-pulse flex justify-center gap-4 w-full">
          <div className="h-[74px] bg-gray-200 rounded w-1/3"></div>
          <div className="h-[74px] bg-gray-200 rounded w-1/3"></div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-center w-full">
          <p className="text-gray-500">
            Book condition information not available
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col gap-2 min-w-24 items-center text-center">
          <h1 className="text-xs font-light font-poppins leading-[18px]">
            Book Condition
          </h1>
          <div className="flex flex-col gap-1 items-center">
            <img src={assets.bookIcon} alt="bookIcon" className="w-6 h-6" />
            <h1 className="text-xs font-normal font-poppins leading-[18px]">
              {data.condition || "Used Like New"}
            </h1>
          </div>
        </div>
        <div className="h-[74px] w-px bg-gray-300"></div>
        <div className="flex flex-col gap-2 min-w-24 items-center text-center">
          <h1 className="text-xs font-light leading-[18px]">Book language</h1>
          <div className="gap-1 flex flex-col">
            <h1 className="text-xl font-semibold font-['Poltawski_Nowy'] leading-[26px]">
              {data && data.language
                ? data.language.toString().substring(0, 2).toUpperCase()
                : ""}
            </h1>
            <h1 className="text-xs font-normal leading-[18px]">
              {data && data.language}
            </h1>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex flex-col">
      <div className="sticky top-0 z-10">
        <Header />
      </div>
      <div className="flex flex-col items-center">
        {/* Background container */}
        <div
          className="w-full h-[172px] relative"
          style={{ backgroundImage: `url(${assets.bg})` }}
        ></div>

        {/* Content container with flex and gap */}
        <div className="flex flex-col items-center gap-2.5 -mt-34 px-4">
          <img
            src={data && data.coverPhotoUrl ? data.coverPhotoUrl : assets.book}
            alt={data ? data.title : "Books image"}
            className="max-h-[190px] w-auto rounded-lg object-contain z-10"
          />

          {/* Book Information with single loading state */}
          {renderBookInfo()}
        </div>

        {/* Exchange Information */}
        <div className="flex flex-col gap-3 py-4 h-58 w-full max-w-3xl mx-auto ">
          <div className=" flex flex-col gap-2 mx-auto">
            <img
              src={assets.exchange}
              alt="exchange"
              className=" h-6 w-6 mx-auto"
            />
            <p className="text-sm font-normal leading-5 text-center">
              Exchange Condition
            </p>
            {data && data.swapCondition && (
              <p className=" text-[10px] font-light text-center leading-4">
                {data.swapCondition.conditionType === "ByBooks" &&
                  "Swap with these books"}
                {data.swapCondition.conditionType === "ByGenres" &&
                  "Swap with these genres"}
                {data.swapCondition.conditionType === "OpenForOffers" &&
                  "Open to all offers"}
                {data.swapCondition.conditionType === "GiveAway" &&
                  "Free to take"}
              </p>
            )}
          </div>
          <div className="w-full px-4 flex justify-center">
            <div
              className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar scroll-pl-4"
              ref={scrollContainerRef}
              onWheel={handleScroll}
            >
              {renderSwapConditions()}
            </div>
          </div>
        </div>

        {/* Books description */}
        <div className="flex flex-col items-start w-[343px] mx-auto gap-2 my-5">
          <h1 className="text-lg font-light self-start">Book Description</h1>
          <div className="flex flex-col w-full items-start">
            <p
              ref={descriptionRef}
              className={`text-sm ${
                isDescriptionExpanded ? "" : "line-clamp-3"
              } w-full`}
            >
              {data && data.description ? data.description : ""}
            </p>
            {data &&
              data.description &&
              isDescriptionOverflowing &&
              !isDescriptionExpanded && (
                <span
                  className="text-blue-500 text-sm self-end cursor-pointer"
                  onClick={toggleDescription}
                >
                  ...Show More
                </span>
              )}
            {data && data.description && isDescriptionExpanded && (
              <span
                className="text-blue-500 text-sm self-end cursor-pointer"
                onClick={toggleDescription}
              >
                Show Less
              </span>
            )}
          </div>
        </div>

        {/* Book's Condition Information */}
        <div className="bg-white w-full py-6 flex justify-center items-center gap-4 px-2">
          {renderBookConditionInfo()}
        </div>

        {/* Location Information */}
        <div className="w-[343px] mx-auto flex items-center gap-2 my-4">
          <img src={assets.location} alt="location" className="h-4 w-4" />
          <h1 className="text-xs font-normal  leading-[18px] text-left">
            Senate Square, Helsinki
          </h1>
        </div>

        {/* Owner Information  */}
        <div className="w-[343px] mx-auto flex flex-col gap-2 my-4">
          <h1 className="text-xs font-normal font-poppins leading-[18px] text-[#808080]">
            Offered by
          </h1>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={assets.owner} alt="Owner" className="w-4 h-4" />
              <h1 className="text-xs font-normal font-poppins leading-[18px]">
                {data && data.owner ? data.owner.name : "Unknown Owner"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={assets.greenArrow}
                alt="greenArrow"
                className="w-4 h-4"
              />
              <h1 className="text-xs font-normal font-poppins leading-[18px]">
                95% Positive Swaps
              </h1>
            </div>
          </div>
        </div>

        <hr className="w-[343px] mx-auto h-[1px] bg-[#E4E4E4] border-0" />

        {/* More from this user section */}
        <div className="w-[343px] mx-auto flex flex-col justify-between items-center my-4">
          <div className="flex w-full justify-between items-center">
            <h1 className="font-poppins font-normal text-[14px] leading-[20px]">
              More from this user
            </h1>
            <button className="font-poppins font-medium text-[14px] leading-[20px] text-[#3879E9]">
              See All
            </button>
          </div>

          {/* Card Container with grid layout */}
          <div className="w-full mt-2 grid grid-cols-2 gap-x-2 gap-y-4 max-h-[340px] overflow-y-auto pr-1 hide-scrollbar">
            {userOtherBooks.map((book, index) => (
              <div
                key={book.id}
                className={`w-full flex flex-col rounded-lg overflow-hidden shadow-sm bg-white ${
                  index >= 4 ? "mt-1" : ""
                }`}
              >
                <div className="w-full h-[150px]">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="flex flex-col gap-1 items-start p-2 pt-1">
                  <h1 className="font-poppins font-medium text-[12px] leading-[18px] text-left line-clamp-1">
                    {book.title}
                  </h1>
                  <h1 className="font-poppins font-light text-[10px] leading-[15px] text-left">
                    by {book.author}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request option  */}
        <div className="w-full max-w-[800px] bg-white mx-auto flex items-center justify-between px-4 py-3 sticky bottom-0 shadow-md rounded-lg">
          <div className="flex flex-col justify-start">
            <h1 className="font-poppins font-normal text-[8px] leading-[12px] text-[#808080]">
              Offered by
            </h1>
            <h1 className="font-poppins font-normal text-[12px] leading-[18px]">
              {data && data.owner ? data.owner.name : "Unknown Owner"}
            </h1>
          </div>
          <div className="ml-[56px]">
            <button className="bg-[#3879E9] text-white rounded-lg w-[203px] h-[40px] font-poppins font-normal text-[14px] leading-[20px]">
              Request Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
