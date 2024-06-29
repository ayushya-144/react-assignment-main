import React from "react";
import { useGetAllCategoriesQuery } from "../store/apis/categories";
import { Stack, Grid, Skeleton } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const Categories = ({ className }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = Number(searchParams.get("cat"));
  console.log(selectedCategoryId);

  const { data, isLoading, isError, error } = useGetAllCategoriesQuery();

  const handleCategoryChange = (categoryId) => {
    console.log(selectedCategoryId);
    if (categoryId === selectedCategoryId) {
      console.log("object");
      searchParams.delete("cat");
      return setSearchParams(searchParams);
    }
    searchParams.set("cat", categoryId);
    return setSearchParams(searchParams);
  };

  if (isError) {
    return (
      <div className={`${className} my-[50px]`}>
        {error || "Something Went Wrong"}
      </div>
    );
  }

  return (
    <div className={`${className} my-[50px]`}>
      <Grid p={1} container maxHeight="65vh" overflow="auto" spacing={2}>
        {isLoading ? (
          <Grid item width="100%">
            <Stack gap={1}>
              {Array.from({ length: 14 }).map((_, rowIndex) => (
                <Skeleton
                  key={rowIndex}
                  variant="rounded"
                  width="100%"
                  height={30}
                />
              ))}
            </Stack>
          </Grid>
        ) : (
          <Stack gap={1} width="100%">
            {data?.map((item) => (
              <Stack
                onClick={() => handleCategoryChange(item?.id)}
                key={item?.id}
                flexDirection="row"
                boxShadow="0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12)"
                bgcolor={
                  selectedCategoryId === item?.id ? "#d6e8fa" : "#F9FaFc"
                }
                justifyContent="start"
                alignItems="center"
                gap={2}
                p={1}
                borderRadius={2}
                sx={{
                  transition: "0.1s",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor:
                      selectedCategoryId === item?.id ? "#d6e8fa" : "#f2f2f2",
                    transform: "scale(1.01)",
                  },
                }}
              >
                {item?.name}
                <img src={item.icon} alt={item?.name} height={24} width={24} />
              </Stack>
            ))}
          </Stack>
        )}
      </Grid>
    </div>
  );
};

export default Categories;
