const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs"); 
const Report = require("../model/reportsmodel");

const downloadReport = async (req, res) => {
  try {
    // NOTE: To populate the report with user data (like name for the PDF), 
    // you would need to add .populate('userId', 'fullName') here.
    const report = await Report.findById(req.params.id); 

    if (!report) {
      return res.status(404).send("Report not found");
    }
    
    const doc = new PDFDocument({ margin: 50 });
    
    // 🔑 DOWNLOAD SETUP: Set headers to signal a file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${report._id}.pdf`
    );

    // 🔑 CORE CHANGE: Pipe the document stream directly to the response
    doc.pipe(res);
    
    // --- START: Logo in Header Section ---
    // 🔑 IMPORTANT: REPLACE THIS PATH WITH THE ACTUAL LOCATION OF YOUR LOGO FILE
    const logoPath = path.join(__dirname, '..', 'assets', 'Vaccibitelogo.png'); 

    if (fs.existsSync(logoPath)) {
        // Place image on the left side, slightly lower than top margin (50)
        doc.image(logoPath, 50, 40, { width: 60 }); 
        doc.moveDown(1.5); // Move down to clear the logo area
    } else {
        doc.moveDown(0.5); // Maintain some top spacing if no logo
        console.warn("PDF generation warning: Logo image not found at expected path.");
    }
    // --- END: Logo in Header Section ---
    
    // Report title
    doc.fontSize(20).text("Incident Report", { align: "center" });
    doc.moveDown();

    // 🔑 INTEGRATION: Add detailed content
    
    // Category
    doc.fontSize(14).text(`Category: ${report.type}`, { underline: true });
    doc.moveDown(1.5);

    // Dynamic category details
    if (report.categoryDetails && Object.keys(report.categoryDetails).length > 0) {
      doc.fontSize(12).text("Report Details:");
      Object.entries(report.categoryDetails).forEach(([key, val]) => {
        doc.text(`${key}: ${val || "N/A"}`);
      });
      doc.moveDown();
    } else {
      doc.text("⚠️ No additional details available.");
    }
    
    // Attached file handling
    if (report.filePath) {
      try {
        // Ensure image path is constructed correctly for the server's file system
        const imagePath = path.join(__dirname, "..", report.filePath); 
        
        if (fs.existsSync(imagePath)) { // Check file existence before trying to load
            doc.addPage(); // Start image on a new page for clarity
            doc.fontSize(16).text("Attached Image", { align: "center" });
            doc.moveDown();

            doc.image(imagePath, {
                fit: [400, 400],
                align: "center",
                valign: "center",
            });
        } else {
            doc.text("⚠️ Referenced image file not found on server.");
        }
      } catch (err) {
        console.error("Image processing error:", err);
        doc.text("⚠️ Could not load image due to processing error.");
      }
    }
    
    // 🔑 Final element to flush the document and send the response
    doc.end();

  } catch (err) {
    console.error("Error generating report:", err);
    // If an error occurs, the stream must be closed, and status sent
    if (!res.headersSent) {
        res.status(500).send("Error generating report");
    }
  }
};

module.exports = { downloadReport };
