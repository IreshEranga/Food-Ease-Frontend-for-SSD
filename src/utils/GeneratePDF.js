import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { successMessage } from "./Alert";
import TastiGoLogo from "../assets/Images/T.png";

// Helper function to format column names
const formatColumnName = (col) => {
  return col
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove leading/trailing spaces
};

export function generatePDF(columns, data, fileName, title = "Report") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    lineHeight: 1.2,
  });

  const tableRows = [];

  // Add custom styling options
  const tableStyles = {
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: [44, 62, 80],
      lineWidth: 0.1,
    },
    margin: { top: 20, bottom: 20, left: 10, right: 10 },
  };

  // Add the logo and title to the header of the PDF
  doc.addImage(TastiGoLogo, "PNG", 15, 10, 30, 30);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 15, { align: "center" });

  // Validate data
  if (!Array.isArray(data)) {
    console.error("Data is not an array:", data);
    return; // Exit if data is invalid
  }

  // Prepare table data dynamically based on columns
  data.forEach((item) => {
    const rowData = columns.map((col) => {
      // Handle date fields or other special cases if needed
      const value = item[col];
      return value instanceof Date ? value.toLocaleString() : value || "-";
    });
    tableRows.push(rowData);
  });

  // Format column headers with spaces
  const formattedHeaders = columns.map((col) => formatColumnName(col));

  // Generate table
  autoTable(doc, {
    head: [formattedHeaders],
    body: tableRows,
    ...tableStyles,
    startY: 40,
    didDrawPage: function (data) {
      if (data.pageNumber === 1) {
        doc.addImage(TastiGoLogo, "PNG", 15, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 105, 15, { align: "center" });
      }
      doc.setFont("helvetica");
      doc.setFontSize(10);
      doc.text(
        `TastiGo`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.setLineWidth(0.5);
      doc.line(
        20,
        doc.internal.pageSize.getHeight() - 15,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 15
      );
    },
  });

  doc.save(fileName + ".pdf");
  successMessage("Success", "Your Report has been downloaded");
}