import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  IconButton,
  Input,
  Skeleton,
} from "@mui/material";
import {
  Close,
  CloudUpload as CloudUploadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from "@mui/icons-material";
import { getUploadedAudios, uploadAudioToCloudinary } from "../services/api";

interface AudioDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectAudio: (url: string) => void;
}

interface CloudinaryAudio {
  public_id: string;
  secure_url: string;
  created_at: string;
}

const AudioDialog: React.FC<AudioDialogProps> = ({
  open,
  onClose,
  onSelectAudio,
}) => {
  const [audios, setAudios] = useState<CloudinaryAudio[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadAudios(true);
    } else {
      // Reset state when dialog closes
      setAudios([]);
      setNextCursor(undefined);
      setHasMore(false);
      setPlayingId(null);
    }
  }, [open]);

  useEffect(() => {
    if (playingId) {
      const audio = document.querySelector(`audio[data-id="${playingId}"]`) as HTMLAudioElement;
      if (audio) audio.play();
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause());
    }
  }, [playingId]);

  const loadAudios = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setAudios([]);
      setNextCursor(undefined);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await getUploadedAudios({
        limit: 10,
        nextCursor: reset ? undefined : nextCursor,
      });

      if (reset) {
        setAudios(result.audios);
      } else {
        setAudios((prev) => [...prev, ...result.audios]);
      }

      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load audios:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleAudioSelect = (audioUrl: string) => {
    onSelectAudio(audioUrl);
    onClose();
  };

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
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
          "modal-audio-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh audios list
        loadAudios(true);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Audio</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: "70vh",
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {audios.map((audio) => (
              <Grid item xs={12} sm={6} md={4} key={audio.public_id}>
                <Card>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(audio.public_id);
                        }}
                        size="small"
                      >
                        {playingId === audio.public_id ? (
                          <PauseIcon />
                        ) : (
                          <PlayArrowIcon />
                        )}
                      </IconButton>
                      <Box sx={{ ml: 1, flex: 1 }}>
                        <Typography variant="body2" noWrap>
                          {audio.public_id.split('/').pop()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(audio.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAudioSelect(audio.secure_url)}
                      sx={{ ml: 1 }}
                    >
                      Select
                    </Button>
                  </Box>
                  <audio
                    src={audio.secure_url}
                    data-id={audio.public_id}
                    onEnded={() => setPlayingId(null)}
                    style={{ display: 'none' }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {audios.length === 0 && !loading && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No audios uploaded yet.
          </Typography>
        )}
      </DialogContent>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Input
          type="file"
          inputProps={{ accept: "audio/*" }}
          id="modal-audio-upload"
          onChange={handleFileSelect}
          sx={{ display: "none" }}
        />
        <Button
          variant="outlined"
          component="label"
          htmlFor="modal-audio-upload"
          startIcon={
            uploadLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />
          }
          sx={{ borderRadius: "8px" }}
        >
          {uploadLoading ? "Uploading..." : "Upload New Audio"}
        </Button>

        {hasMore && (
          <Button
            variant="contained"
            onClick={() => loadAudios(false)}
            disabled={loadingMore}
            sx={{ borderRadius: "8px" }}
          >
            {loadingMore ? "Loading..." : "Load More Audios"}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default AudioDialog;