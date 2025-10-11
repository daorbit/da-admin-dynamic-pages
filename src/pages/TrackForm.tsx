import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Image } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createTrack, updateTrack } from "../store/slices/tracksSlice";
import { tracksAPI, playlistsAPI } from "../services/api";
import ImageDialog from "../components/ImageDialog";
import type { CreateTrackData, Playlist } from "../types";

const trackSchema = yup.object({
  title: yup
    .string()
    .optional()
    .max(200, "Title cannot be more than 200 characters"),
  author: yup
    .string()
    .optional()
    .max(100, "Author cannot be more than 100 characters"),
  description: yup
    .string()
    .optional()
    .max(500, "Description cannot be more than 500 characters"),
  duration: yup.string().optional(),
  listeners: yup.string().optional(),
  date: yup.string().optional(),
  thumbnail: yup.string().optional().url("Must be a valid URL"),
  category: yup
    .string()
    .optional()
    .max(50, "Category cannot be more than 50 characters"),
  audioUrl: yup.string().optional().url("Must be a valid URL"),
  playlistId: yup.string().optional(),
});

const TrackForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.tracks);

  const [loadingTrack, setLoadingTrack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateTrackData>({
    resolver: yupResolver(trackSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      duration: "",
      listeners: "",
      date: "",
      thumbnail: "",
      category: "",
      audioUrl: "",
      playlistId: "",
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoadingTrack(true);
      tracksAPI
        .getById(id)
        .then((response) => {
          reset({
            title: response.data.title || "",
            author: response.data.author || "",
            description: response.data.description || "",
            duration: response.data.duration || "",
            listeners: response.data.listeners || "",
            date: response.data.date || "",
            thumbnail: response.data.thumbnail || "",
            category: response.data.category || "",
            audioUrl: response.data.audioUrl || "",
            playlistId: response.data.playlists?.[0] || "",
          });
        })
        .catch((err) => {
          setError("Failed to load track");
          console.error("Error loading track:", err);
        })
        .finally(() => {
          setLoadingTrack(false);
        });
    }
  }, [id, isEditing, reset]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await playlistsAPI.getAll({ limit: 100 });
        console.log('Playlists response:', JSON.stringify(response, null, 2));
        setPlaylists(response.data.playlists || (response.data as any).data?.playlists || []);
        console.log('Playlists set:', response.data.playlists || (response.data as any).data?.playlists || []);
      } catch (err) {
        console.error("Error loading playlists:", err);
      }
    };

    fetchPlaylists();
  }, []);

  const onSubmit = async (data: CreateTrackData) => {
    try {
      let track;
      if (isEditing && id) {
        track = await dispatch(updateTrack({ id, trackData: data })).unwrap();
      } else {
        track = await dispatch(createTrack(data)).unwrap();
        
        // Add track to selected playlist
        if (data.playlistId) {
          try {
            await playlistsAPI.addTracks(data.playlistId, [track._id]);
          } catch (err) {
            console.error(`Error adding track to playlist ${data.playlistId}:`, err);
          }
        }
      }
      navigate("/tracks");
    } catch (err) {
      console.error("Error saving track:", err);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setValue('thumbnail', imageUrl);
  };

  if (loadingTrack) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isEditing ? "Edit Track" : "Create New Track"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ py: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Title
              </Typography>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Author
              </Typography>
              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.author}
                    helperText={errors.author?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Description
              </Typography>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Duration
              </Typography>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="e.g., 3:45"
                    error={!!errors.duration}
                    helperText={errors.duration?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Listeners
              </Typography>
              <Controller
                name="listeners"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    error={!!errors.listeners}
                    helperText={errors.listeners?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Release Date
              </Typography>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Category
              </Typography>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Thumbnail
              </Typography>
              <Box display="flex" gap={1}>
                <Controller
                  name="thumbnail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Enter image URL or select from gallery"
                      error={!!errors.thumbnail}
                      helperText={errors.thumbnail?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                  )}
                />
                <IconButton
                  onClick={() => setImageDialogOpen(true)}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <Image />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Audio URL
              </Typography>
              <Controller
                name="audioUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.audioUrl}
                    helperText={errors.audioUrl?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Playlists (Optional)
              </Typography>
              <Controller
                name="playlistId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {playlists.map((playlist) => (
                      <MenuItem key={playlist._id} value={playlist._id}>
                        {playlist.title || "Untitled Playlist"}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/tracks")}
              disabled={loading}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}
            >
              {loading ? (
                <CircularProgress
                  size={16}
                  style={{ color: "#fff", marginRight: "8px" }}
                />
              ) : (
                ""
              )}
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Track"
                : "Create Track"}
            </Button>
          </Box>
        </form>
      </Box>

      <ImageDialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </Box>
  );
};

export default TrackForm;
