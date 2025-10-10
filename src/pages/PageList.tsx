import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
} from '@mui/material'
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPages, deletePage, setSearchTerm, setPagination } from '../store/slices/pagesSlice'
import type { Page } from '../types'

const PageList: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: pages, loading, error, pagination, searchTerm, lastFetched } = useAppSelector(
    (state) => state.pages
  )

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [pageToDelete, setPageToDelete] = React.useState<Page | null>(null)

  useEffect(() => {
    // Only fetch if we haven't fetched recently or if pagination/search changed
    const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for pages list
    const shouldFetch = !lastFetched || (Date.now() - lastFetched) > CACHE_DURATION

    if (shouldFetch || pagination.page !== 1 || pagination.pageSize !== 10 || searchTerm !== '') {
      dispatch(fetchPages({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm
      }))
    }
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, lastFetched])

  const handleEdit = (id: string) => {
    navigate(`/pages/edit/${id}`)
  }

  const handleDelete = (page: Page) => {
    setPageToDelete(page)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pageToDelete) return

    try {
      await dispatch(deletePage(pageToDelete._id))
      setDeleteDialogOpen(false)
      setPageToDelete(null)
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value))
  }

  const handlePaginationChange = (newPaginationModel: { page: number; pageSize: number }) => {
    dispatch(setPagination({
      page: newPaginationModel.page + 1, // Convert to 1-based
      pageSize: newPaginationModel.pageSize
    }))
  }

  const handlePreview = (page: Page) => {
    // Navigate to preview page
    navigate(`/pages/preview/${page.slug}`)
  }

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'groups',
      headerName: 'Groups',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.slice(0, 2).map((group: string, index: number) => (
            <Chip key={index} label={group} size="small" />
          ))}
          {params.value.length > 2 && (
            <Chip 
              label={`+${params.value.length - 2}`} 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>
      ),
    },
    {
      field: 'editorType',
      headerName: 'Editor',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={params.value === 'summernote' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams<Page>) => [
        <GridActionsCellItem
          key="preview"
          icon={
            <Tooltip title="Preview">
              <VisibilityIcon />
            </Tooltip>
          }
          label="Preview"
          onClick={() => handlePreview(params.row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEdit(params.row._id)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pages/new')}
        >
          Create New Page
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search pages..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={pages}
          columns={columns}
          getRowId={(row) => row._id}
          paginationModel={{
            page: pagination.page - 1, // Convert to 0-based for DataGrid
            pageSize: pagination.pageSize
          }}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 25]}
          rowCount={pagination.totalItems}
          paginationMode="server"
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              border: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
              border: 'none',
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the page "{pageToDelete?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PageList