import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchImages } from "../store/slices/imagesSlice";

const Images: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: images, loading, error, lastFetched } = useAppSelector(
    (state) => state.images
  );

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const shouldFetch =
      !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    if (shouldFetch) {
      dispatch(fetchImages());
    }
  }, [dispatch, lastFetched]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1}}>
      <Typography variant="h6" component="h1" gutterBottom>
        Uploaded Images
      </Typography>

      {images.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No images uploaded yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.public_id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.secure_url}
                  alt={`Uploaded image ${image.public_id}`}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {new Date(image.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {image.public_id}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Images;