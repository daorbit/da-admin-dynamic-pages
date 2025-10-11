import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { getUploadedImages } from '../services/api';

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
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
}) => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

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

  const handleImageSelect = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Image</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
      
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
                <Card>
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
            No images uploaded yet.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;