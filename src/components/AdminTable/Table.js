import React, { useState } from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

const AdminTableComponent = ({ columns, data, onEdit, onDelete, pageSize = 5, disableEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  return (
    <div>
      <div className="table-responsive">
        <Table className="align-middle text-center table table-striped table-hover">
          <thead className="table-dark" style={{ backgroundColor: '#EB5B00', color: 'white' }}>
            <tr style={{ backgroundColor: '#EB5B00', color: 'white' }}>
              {columns.map((col, idx) => (
                <th style={{ backgroundColor: '#EB5B00', color: 'white' }} key={idx}>
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th style={{ backgroundColor: '#EB5B00', color: 'white' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>No data available</td>
              </tr>
            ) : (
              currentData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, cidx) => (
                    <td key={cidx}>{row[col.key]}</td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      {onEdit && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => onEdit(row)}
                          disabled={disableEdit ? disableEdit(row) : false}
                        >
                          <PencilSquare />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="danger" size="sm" onClick={() => onDelete(row)}>
                          <Trash />
                          Delete
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default AdminTableComponent;