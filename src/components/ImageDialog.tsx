import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { CloudUpload, Image, Close } from '@mui/icons-material';
import { uploadToCloudinary, getUploadedImages } from '../services/api';

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentImage?: string;
}

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  open,
  onClose,
  onSelectImage,
  currentImage,
}) => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');

  useEffect(() => {
    if (open) {
      loadImages();
      setSelectedImage(currentImage || '');
    }
  }, [open, currentImage]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const uploadedImages = await getUploadedImages();
      setImages(uploadedImages);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setSelectedImage(imageUrl);
      // Reload images to include the new one
      await loadImages();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleConfirm = () => {
    onSelectImage(selectedImage);
    onClose();
  };

  const handleClose = () => {
    setSelectedImage(currentImage || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select or Upload Image</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload New Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<Image />}
              onClick={loadImages}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Images'}
            </Button>
          </Box>
        </Box>

        {uploading && (
          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Uploading image...
            </Typography>
          </Box>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Select from uploaded images:
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={6} sm={4} md={3} key={image.public_id}>
                <Card
                  sx={{
                    border: selectedImage === image.secure_url ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  }}
                >
                  <CardActionArea onClick={() => handleImageSelect(image.secure_url)}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={image.secure_url}
                      alt="Uploaded image"
                      sx={{ objectFit: 'cover' }}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {images.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No images uploaded yet. Upload an image to get started.
          </Typography>
        )}

        {selectedImage && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Selected Image:
            </Typography>
            <Box
              component="img"
              src={selectedImage}
              alt="Selected"
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedImage}
        >
          Select Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageDialog;