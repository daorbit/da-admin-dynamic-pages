import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
} from "@mui/icons-material";
import { playlistsAPI } from "../services/api";
import type { Playlist, Track } from "../types";

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await playlistsAPI.getById(id);
        setPlaylist(response.data);
      } catch (err) {
        console.error("Error fetching playlist:", err);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handlePlayTrack = (trackIndex: number) => {
    if (currentTrackIndex === trackIndex && isPlaying) {
      // Pause current track
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
    } else {
      // Play new track or resume
      if (audioElement) {
        audioElement.pause();
      }

      if (playlist && playlist.tracks[trackIndex]?.audioUrl) {
        const audio = new Audio(playlist.tracks[trackIndex].audioUrl);
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          // Auto-play next track
          if (trackIndex < playlist.tracks.length - 1) {
            handlePlayTrack(trackIndex + 1);
          }
        });
        audio.play();
        setAudioElement(audio);
        setCurrentTrackIndex(trackIndex);
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (playlist && currentTrackIndex !== null && currentTrackIndex < playlist.tracks.length - 1) {
      handlePlayTrack(currentTrackIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      handlePlayTrack(currentTrackIndex - 1);
    }
  };

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

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

  if (error || !playlist) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Playlist not found"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/playlists")}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Playlists
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/playlists")}
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
        }}
      >
        Back to Playlists
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              {playlist.thumbnail && (
                <CardMedia
                  component="img"
                  height="200"
                  image={playlist.thumbnail}
                  alt={playlist.title}
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h1" gutterBottom>
                {playlist.title || 'Untitled Playlist'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {playlist.description || 'No description'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${playlist.trackCount} tracks`}
                  variant="outlined"
                />
                {playlist.duration && (
                  <Chip
                    label={`Duration: ${playlist.duration}`}
                    variant="outlined"
                  />
                )}
                <Chip
                  label={playlist.isPublic ? 'Public' : 'Private'}
                  color={playlist.isPublic ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
              {playlist.createdBy && (
                <Typography variant="body2" color="text.secondary">
                  Created by: {playlist.createdBy}
                </Typography>
              )}
              {playlist.tags && playlist.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {playlist.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audio Controls */}
      {currentTrackIndex !== null && playlist.tracks[currentTrackIndex] && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handlePrevious} disabled={currentTrackIndex === 0}>
                <PreviousIcon />
              </IconButton>
              <IconButton
                onClick={() => handlePlayTrack(currentTrackIndex)}
                color="primary"
                size="large"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton
                onClick={handleNext}
                disabled={currentTrackIndex === playlist.tracks.length - 1}
              >
                <NextIcon />
              </IconButton>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1">
                  Now Playing: {playlist.tracks[currentTrackIndex].title || 'Untitled'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {playlist.tracks[currentTrackIndex].author || 'Unknown Artist'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tracks List */}
      <Typography variant="h6" component="h2" gutterBottom>
        Tracks ({playlist.tracks.length})
      </Typography>
      <Card>
        <List>
          {playlist.tracks.map((track: Track, index: number) => (
            <React.Fragment key={track._id}>
              <ListItem
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={track.thumbnail}
                    variant="rounded"
                    sx={{ width: 50, height: 50 }}
                  >
                    {track.title?.charAt(0) || 'T'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={track.title || 'Untitled'}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {track.author || 'Unknown Artist'}
                      </Typography>
                      {track.duration && (
                        <>
                          <Typography variant="body2" component="span" sx={{ mx: 1 }}>•</Typography>
                          <Typography variant="body2" component="span">
                            {track.duration}
                          </Typography>
                        </>
                      )}
                      {track.audioUrl && (
                        <>
                          <Typography variant="body2" component="span" sx={{ mx: 1 }}>•</Typography>
                          <Typography variant="body2" component="span" color="primary">
                            Audio URL: {track.audioUrl}
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                />
                <IconButton
                  onClick={() => handlePlayTrack(index)}
                  color={currentTrackIndex === index && isPlaying ? "primary" : "default"}
                >
                  {currentTrackIndex === index && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </ListItem>
              {index < playlist.tracks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
};

export default PlaylistDetail;