import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  FormHelperText,
} from "@mui/material";
import { pagesAPI } from "../services/api";
import SummernoteEditor, {
  SummernoteEditorRef,
} from "../components/SummernoteEditor";
import QuillEditor, { QuillEditorRef } from "../components/QuillEditor";
import { useAppDispatch } from "../store/hooks";
import { createPage } from "../store/slices/pagesSlice";
import { useAIGeneration, AIProvider } from "../hooks/useAIGeneration";
import type { CreatePageData } from "../types";

const pageSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(200, "Title cannot be more than 200 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(500, "Description cannot be more than 500 characters"),
  imageUrl: yup
    .string()
    .required("Image URL is required")
    .url("Must be a valid URL"),
  thumbnailUrl: yup
    .string()
    .required("Thumbnail URL is required")
    .url("Must be a valid URL"),
  groups: yup
    .array()
    .of(yup.string().required())
    .defined()
    .default([])
    .max(10, "Cannot have more than 10 groups"),
  editorType: yup
    .string()
    .required("Editor type is required")
    .oneOf(
      ["summernote", "quill"] as const,
      "Editor type must be markdown, summernote, or quill"
    ),
  slug: yup
    .string()
    .optional()
    .max(100, "Slug cannot be more than 100 characters")
    .matches(
      /^[a-z0-9-]*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  content: yup.string(),
}) satisfies yup.ObjectSchema<CreatePageData>;

const PageForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupInput, setGroupInput] = useState("");
  const [selectedAI, setSelectedAI] = useState<AIProvider>("gemini");

  const { generateContent, generating } = useAIGeneration({
    onContentGenerated: (content: string) => {
      setValue("content", content);
    },
    onError: (errorMessage: string) => {
      setError(errorMessage);
    },
  });

  const summernoteRef = useRef<SummernoteEditorRef>(null);
  const quillRef = useRef<QuillEditorRef>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreatePageData>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      thumbnailUrl: "",
      groups: [],
      editorType: "summernote" as const,
      slug: "",
      content: undefined,
    },
  });

  const watchedTitle = watch("title");
  const watchedGroups = watch("groups");
  const watchedEditorType = watch("editorType");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !isEditing) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [watchedTitle, setValue, isEditing]);

  // Load page data for editing
  useEffect(() => {
    if (isEditing && id) {
      const loadPage = async () => {
        try {
          setLoading(true);
          const response = await pagesAPI.getById(id);
          const page = response.data;

          reset({
            title: page.title,
            description: page.description,
            imageUrl: page.imageUrl,
            thumbnailUrl: page.thumbnailUrl,
            groups: page.groups,
            editorType: page.editorType,
            slug: page.slug,
            content: page.content,
          });
        } catch (err) {
          console.error("Error loading page:", err);
          setError("Failed to load page data");
        } finally {
          setLoading(false);
        }
      };

      loadPage();
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data: CreatePageData) => {
    let currentContent = data.content;
    if (data.editorType === "summernote" && summernoteRef.current) {
      currentContent = summernoteRef.current.getContent();
    } else if (data.editorType === "quill" && quillRef.current) {
      currentContent = quillRef.current.getContent();
    }
    // For markdown, use the form data directly
    const finalData = { ...data, content: currentContent };
    console.log("Form data being submitted:", finalData);
    try {
      setLoading(true);
      setError(null);

      if (isEditing && id) {
        await pagesAPI.update(id, { ...finalData, _id: id });
      } else {
        await dispatch(createPage(finalData));
      }

      navigate("/pages");
    } catch (err) {
      console.error("Error saving page:", err);
      setError(isEditing ? "Failed to update page" : "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = () => {
    if (groupInput.trim() && !watchedGroups.includes(groupInput.trim())) {
      setValue("groups", [...watchedGroups, groupInput.trim()]);
      setGroupInput("");
    }
  };

  const handleRemoveGroup = (groupToRemove: string) => {
    setValue(
      "groups",
      watchedGroups.filter((group) => group !== groupToRemove)
    );
  };

  const handleGroupInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddGroup();
    }
  };

  const handleGenerateContent = () => {
    const title = watch("title");
    const description = watch("description");
    generateContent(selectedAI, title, description);
  };

  // if (loading && isEditing) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
  //       <CircularProgress />
  //     </Box>
  //   )
  // }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isEditing ? "Edit Page" : "Create New Page"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ py: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Title *
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

            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Slug
              </Typography>
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
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
                Description *
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

            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Image URL *
              </Typography>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Thumbnail URL *
              </Typography>
              <Controller
                name="thumbnailUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.thumbnailUrl}
                    helperText={errors.thumbnailUrl?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Editor Type *
              </Typography>
              <Controller
                name="editorType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.editorType}>
                    <Select
                      {...field}
                      sx={{
                        borderRadius: "8px",
                      }}
                    >
                      <MenuItem value="summernote">Summernote Editor</MenuItem>
                      <MenuItem value="quill">Quill Editor</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.editorType?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Groups
              </Typography>
              <Box>
                <TextField
                  fullWidth
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  onKeyPress={handleGroupInputKeyPress}
                  helperText=""
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {watchedGroups.map((group, index) => (
                    <Chip
                      key={index}
                      label={group}
                      onDelete={() => handleRemoveGroup(group)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontSize: "13px" }}>
                        Content
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        <FormControl sx={{ minWidth: 200 }}>
                          <Select
                            value={selectedAI}
                            onChange={(e) =>
                              setSelectedAI(e.target.value as AIProvider)
                            }
                            displayEmpty
                            size="small"
                          >
                            <MenuItem value="gemini">Gemini</MenuItem>
                            <MenuItem value="perplexity">Perplexity</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          onClick={handleGenerateContent}
                          disabled={generating}
                          size="large"
                          sx={{
                            minWidth: 150,
                            borderRadius: "8px",
                            boxShadow: "none",
                          }}
                        >
                          {generating ? (
                            <CircularProgress size={20} />
                          ) : (
                            "Generate with AI"
                          )}
                        </Button>
                      </Box>
                    </Box>
                    {watchedEditorType === "summernote" ? (
                      <SummernoteEditor
                        ref={summernoteRef}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter your page content here..."
                        height={400}
                      />
                    ) : watchedEditorType === "quill" ? (
                      <QuillEditor
                        ref={quillRef}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter your page content here..."
                        height={400}
                      />
                    ) : (
                      <TextField
                        {...field}
                        multiline
                        rows={15}
                        fullWidth
                        placeholder="Enter your page content here..."
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                    {errors.content && (
                      <FormHelperText error>
                        {errors.content.message}
                      </FormHelperText>
                    )}
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/pages")}
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
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default PageForm;
