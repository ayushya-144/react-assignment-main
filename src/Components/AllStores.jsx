import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetAllStoresQuery } from "../store/apis/stores";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {debounce} from "@mui/material";
import { debounceForSearch } from "../utils/commonFunctions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

const STORE_SORTS = [
  { title: "Name", key: "name" },
  { title: "Featured", key: "featured", order: "asc" },
  { title: "Featured", key: "featured", order: "desc" },
  { title: "Clicks", key: "clicks" },
];

const AllStores = ({ className }) => {
  const [pagination, setPagination] = useState({
    _page: 1,
    _limit: 20,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [lazyData, setLazyData] = useState([]);
  const [bookmarkedData, setBookMarkedData] = useState(
    JSON.parse(localStorage.getItem("bookmarkedData")) || []
  );
  const cats = Number(searchParams.get("cat"));
  const name_like = searchParams.get("name_like");
  const containerRef = useRef();

  console.log(JSON.parse(localStorage.getItem("bookmarkedData")));

  // Get All Stores API Call
  const {
    data: storeData,
    error,
    isLoading,
    isSuccess,
    originalArgs,
    isError,
  } = useGetAllStoresQuery(
    {
      _sort: searchParams.get("_sort") || STORE_SORTS[0].key,
      order: searchParams.get("_order"),
      name_like,
      cats: cats || null,
      ...pagination,
    },
    // cats || name_like ? { cats: cats || null, name_like } : pagination,
    { refetchOnMountOrArgChange: true }
  );

  // For Infinite Scrolling
  useEffect(() => {
    if (!storeData?.length) return;
    if (cats || name_like) return;

    const fetchMoreData = debounce(() => {
      if (
        containerRef.current &&
        window.innerHeight + containerRef.current.scrollTop + 1 >=
          containerRef.current.scrollHeight
      ) {
        if (!isLoading && isSuccess) {
          if (originalArgs?._page === pagination?._page) {
            setPagination((prev) => ({ ...prev, _page: prev._page + 1 }));
          }
        }
      }
    }, 200);

    const currentRef = containerRef.current;
    currentRef.addEventListener("scroll", fetchMoreData);

    return () => {
      currentRef.removeEventListener("scroll", fetchMoreData);
    };
  }, [
    storeData,
    pagination,
    isLoading,
    isSuccess,
    originalArgs,
    cats,
    name_like,
  ]);

  const onSearch = useCallback(
    (e) => {
      debounceForSearch(() => {
        const searchText = e.target.value;
        if (searchText.length === 0) {
          searchParams.delete("name_like");
          return setSearchParams(searchParams, { replace: true });
        }
        searchParams.set("name_like", searchText);
        setSearchParams(searchParams, { replace: true });
      }, 500);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (
      (storeData?.length && !lazyData?.length) ||
      // searchParams.get("_sort") ||
      // searchParams.get("_order") ||
      cats ||
      name_like ||
      pagination?._page === 1
    ) {
      setLazyData(storeData);
    } else if (storeData?.length) {
      setLazyData((prevData) => {
        const uniqueData = new Set([...prevData, ...storeData]);
        return Array.from(uniqueData);
      });
    }
  }, [
    storeData,
    lazyData?.length,
    name_like,
    cats,
    pagination?._page,
    // searchParams,
  ]);

  if (isError) {
    return (
      <div className={`my-[50px] ${className}`}>
        {error || "Something Went Wrong"}
      </div>
    );
  }

  const handleBookmarkToggle = (store) => {
    setBookMarkedData((prevBMData) => {
      let updatedBMData;
      if (prevBMData.includes(store.id)) {
        updatedBMData = prevBMData.filter((id) => id !== store.id);
      } else {
        updatedBMData = [...prevBMData, store.id];
      }
      localStorage.setItem("bookmarkedData", JSON.stringify(updatedBMData));
      return updatedBMData;
    });
  };

  console.log(bookmarkedData);

  return (
    <div className={`my-[50px] ${className}`}>
      <Grid
        p={1}
        container
        maxHeight="65vh"
        overflow="auto"
        spacing={2}
        ref={containerRef}
        position="relative"
      >
        <Grid item xs={12} position="sticky" top={0} zIndex={100}>
          <Stack width="100%" flexDirection="row" gap={2}>
            <Paper
              component="form"
              sx={{
                width: "70%",
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase
                defaultValue={name_like}
                sx={{ flex: 1 }}
                onChange={onSearch}
                placeholder="Search Stores"
              />
            </Paper>
            <Paper
              component="form"
              sx={{
                width: "30%",
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                <Select
                  variant="standard"
                  sx={{ width: "100%" }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={
                    STORE_SORTS?.find((item) => {
                      if (searchParams.get("_order")) {
                        return (
                          item?.key === searchParams.get("_sort") &&
                          item?.order === searchParams.get("_order")
                        );
                      }
                      return item?.key === searchParams.get("_sort");
                    }) || STORE_SORTS[0]
                  }
                  placeholder="Age"
                  label="Filter"
                  onChange={(e, newValue) => {
                    const menuItem = e.target.value;
                    searchParams.set("_sort", menuItem?.key);
                    if (menuItem?.order) {
                      searchParams.set("_order", menuItem?.order);
                    } else {
                      searchParams.delete("_order");
                    }
                    setSearchParams(searchParams);
                  }}
                >
                  {STORE_SORTS?.map((menuItem, index) => {
                    return (
                      <MenuItem key={index} value={menuItem}>
                        {menuItem?.title}{" "}
                        {menuItem?.order
                          ? menuItem?.order === "asc"
                            ? "Ascending"
                            : "Desceding"
                          : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Paper>
          </Stack>
        </Grid>
        {isLoading ? (
          Array.from({ length: 9 }).map((_, rowIndex) => (
            <Grid key={rowIndex} item xs={4} overflow="hidden">
              <Skeleton variant="rectangular" height="200px" />
            </Grid>
          ))
        ) : lazyData?.length > 0 ? (
          lazyData?.map((store) => (
            <Grid item xs={4} key={store?.id}>
              <Stack
                onClick={() => window.open(store?.homepage, "_blank")}
                borderRadius={4}
                height="200px"
                boxShadow="0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12)"
                justifyContent="center"
                alignItems="center"
                bgcolor="#F9FaFc"
                sx={{
                  cursor: "pointer",
                  transition: "0.1s",
                  overflow: "hidden",
                  "&:hover": {
                    backgroundColor: "#f2f2f2",
                    transform: "scale(1.03)",
                  },
                }}
                position="relative"
                gap={1}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarkToggle(store);
                  }}
                  sx={{ position: "absolute", top: 5, right: 5 }}
                >
                  {bookmarkedData?.includes(store.id) ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                <img
                  src={store.logo}
                  alt={store?.name}
                  style={{
                    height: "60px",
                  }}
                />
                <Typography textAlign="center">{store?.name}</Typography>
                <Stack>
                  <Typography textAlign="center" fontWeight={600}>
                    Cashback:
                  </Typography>
                  <Typography textAlign="center">
                    {Boolean(store?.cashback_enabled)
                      ? store?.amount_type === "fixed"
                        ? `${store?.cashback_amount.toFixed(2)}$`
                        : `${store?.cashback_amount.toFixed(2)}%`
                      : "No cashback available"}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          ))
        ) : (
          <Stack height="100%" width="100%" overflow="hidden">
            <Typography textAlign="center">No Data Found</Typography>
          </Stack>
        )}
      </Grid>
    </div>
  );
};

export default AllStores;
