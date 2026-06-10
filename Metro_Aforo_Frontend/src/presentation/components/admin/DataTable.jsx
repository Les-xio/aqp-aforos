import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, IconButton, Tooltip, Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

export function DataTable({
  columns, data, total, page, rowsPerPage, onPageChange, onRowsPerPageChange,
  onEdit, onDelete, onView, extraActions, loading,
}) {
  return (
    <Paper elevation={0} sx={{
      border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,.04)',
    }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{
                  fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12,
                  color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px',
                  fontFamily: font, py: 1.5,
                }}>
                  {col.label}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell sx={{
                  fontWeight: 700, textAlign: 'center', fontSize: 12,
                  color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px',
                  fontFamily: font, py: 1.5,
                }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font }}>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font }}>
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={row.id || row.id_categoria || row.id_subcategoria || row.id_usuario || row.id_turno || row.id_franja || idx}
                  hover
                  sx={{
                    '&:hover': { bgcolor: '#EFF6FF' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView || extraActions) && (
                    <TableCell align="center" sx={{ py: 1.2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {onView && (
                          <Tooltip title="Ver">
                            <IconButton
                              size="small"
                              onClick={() => onView(row)}
                              sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                bgcolor: '#DBEAFE', color: '#2563EB',
                                '&:hover': { bgcolor: '#BFDBFE' },
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row)}
                              sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                bgcolor: '#DBEAFE', color: '#2563EB',
                                '&:hover': { bgcolor: '#BFDBFE' },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(row)}
                              sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                bgcolor: '#FEE2E2', color: '#DC2626',
                                '&:hover': { bgcolor: '#FECACA' },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {extraActions && extraActions(row)}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas:"
          sx={{ fontFamily: font, borderTop: '1px solid #E5E7EB', '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 13 } }}
        />
      )}
    </Paper>
  );
}