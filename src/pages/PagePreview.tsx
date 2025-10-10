import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { pagesAPI } from "../services/api";
import type { Page } from "../types";

const PagePreview: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const response = await pagesAPI.getBySlug(slug);
        setPage(response.data);
      } catch (err) {
        console.error("Error fetching page:", err);
        setError("Failed to load page preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

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

  if (error || !page) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Page not found"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/pages")}
          variant="outlined"
        >
          Back to Pages
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/pages")}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Pages
        </Button>
      </Box>

      <Card>
        <CardContent>
          {page.content && (
            <Box sx={{ mt: 3 }}>
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PagePreview;
