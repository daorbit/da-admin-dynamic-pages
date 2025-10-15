import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Input,
  Skeleton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAudios,
  loadMoreAudios,
  removeAudioLocally,
} from "../store/slices/audiosSlice";
import { uploadAudioToCloudinary } from "../services/api";

const Audios: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: audios,
    loading,
    loadingMore,
    error,
    lastFetched,
    hasMore,
    nextCursor,
  } = useAppSelector((state) => state.audios);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const shouldFetch =
      !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    if (shouldFetch) {
      dispatch(fetchAudios());
    }
  }, [dispatch, lastFetched]);

  useEffect(() => {
    if (playingId) {
      const audio = document.querySelector(`audio[data-id="${playingId}"]`) as HTMLAudioElement;
      if (audio) audio.play();
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause());
    }
  }, [playingId]);

  const handleDeleteAudio = (publicId: string) => {
    if (window.confirm("Are you sure you want to delete this audio?")) {
      // Remove from UI immediately (client-side only)
      dispatch(removeAudioLocally(publicId));
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadLoading(true);
      try {
        await uploadAudioToCloudinary(file);
        // Reset file input
        const fileInput = document.getElementById(
          "audio-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh audios list
        dispatch(fetchAudios());
      } catch (error) {
        console.error("Audio upload failed:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            Uploaded Audios
          </Typography>
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: "8px" }}
          />
        </Box>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="80%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="h1" gutterBottom>
          Uploaded Audios
        </Typography>

        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Input
            type="file"
            inputProps={{ accept: "audio/*" }}
            id="audio-upload"
            onChange={handleFileSelect}
            sx={{ display: "none" }}
          />
          <Button
            variant="contained"
            component="label"
            htmlFor="audio-upload"
            startIcon={
              uploadLoading ? (
                <CircularProgress size={16} />
              ) : (
                <CloudUploadIcon />
              )
            }
            disabled={uploadLoading}
            sx={{ borderRadius: "8px", boxShadow: "none" }}
          >
            {uploadLoading ? "Uploading..." : "Upload Audio"}
          </Button>
        </Box>
      </Box>

      {audios.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No audios uploaded yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {audios.map((audio) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={audio.public_id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "none",
                  position: "relative",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <IconButton
                  onClick={() => handleDeleteAudio(audio.public_id)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                  size="small"
                >
                  <DeleteIcon color="error" />
                </IconButton>
                <Box
                  onClick={() => handlePlay(audio.public_id)}
                  sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px 8px 0 0",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  {playingId === audio.public_id ? (
                    <PauseIcon sx={{ fontSize: 48, color: "#666" }} />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: 48, color: "#666" }} />
                  )}
                </Box>
                <audio
                  src={audio.secure_url}
                  data-id={audio.public_id}
                  onEnded={() => setPlayingId(null)}
                  style={{ display: 'none' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {new Date(audio.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {audio.public_id}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            onClick={() => nextCursor && dispatch(loadMoreAudios(nextCursor))}
            disabled={loadingMore}
            variant="contained"
            startIcon={
              loadingMore ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{ borderRadius: "8px", boxShadow: "none" }}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Audios;