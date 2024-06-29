import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetAllStoresQuery } from "../store/apis/stores";
import {
  Grid,
  IconButton,
  InputBase,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { debounce } from "../utils/commonFunctions";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

const AllStores = ({ className }) => {
  const [pagination, setPagination] = useState({
    _page: 1,
    _limit: 20,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [lazyData, setLazyData] = useState([]);
  const cats = Number(searchParams.get("cat"));
  const name_like = searchParams.get("name_like");
  const containerRef = useRef();

  // Get All Stores API Call
  const {
    data: storeData,
    error,
    isLoading,
    isSuccess,
    originalArgs,
    isError,
  } = useGetAllStoresQuery(
    cats || name_like ? { cats, name_like } : pagination,
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
      fetchMoreData.cancel();
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
      debounce(() => {
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
  }, [storeData, lazyData?.length, name_like, cats, pagination?._page]);

  if (isError) {
    return (
      <div className={`my-[50px] ${className}`}>
        {error || "Something Went Wrong"}
      </div>
    );
  }

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
        <Grid item xs={12} position="sticky" top={0}>
          <Stack width="100%">
            <Paper
              component="form"
              sx={{
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
            <Grid item xs={4} key={store.id} overflow="hidden">
              <Stack
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
                gap={1}
              >
                <img
                  src={store.logo}
                  alt={store?.name}
                  style={{
                    height: "60px",
                  }}
                />
                <Typography textAlign="center">{store?.name}</Typography>
                <Typography>CashBack String</Typography>
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
