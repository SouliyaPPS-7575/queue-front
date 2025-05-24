import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  CardMedia,
  Box,
} from '@mui/material';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

function ImagePreview({
  selectedImage,
  setSelectedImage,
}: {
  selectedImage: string | null;
  setSelectedImage: (value: string | null) => void;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2)); // Max zoom level = 2x
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1)); // Min zoom level = 1x (original)
  };

  return (
    <Dialog
      open={Boolean(selectedImage)}
      onClose={() => setSelectedImage(null)}
      fullScreen
    >
      <DialogContent
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#121212', // ✅ Dark mode background
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => setSelectedImage(null)}
          sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
        >
          <X /> {/* ✅ Lucide Close Icon */}
        </IconButton>

        {/* Zoom In & Zoom Out Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton onClick={handleZoomIn} sx={{ color: 'white' }}>
            <ZoomIn /> {/* ✅ Lucide Zoom In Icon */}
          </IconButton>
          <IconButton onClick={handleZoomOut} sx={{ color: 'white' }}>
            <ZoomOut /> {/* ✅ Lucide Zoom Out Icon */}
          </IconButton>
        </Box>

        {/* Full Image with Scaling */}
        <CardMedia
          component="img"
          image={selectedImage || ''}
          sx={{
            transform: `scale(${zoomLevel})`, // ✅ Scale image based on zoom level
            transition: 'transform 0.3s ease',
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ImagePreview;
