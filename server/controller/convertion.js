const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs"); 
const Report = require("../model/reportsmodel");

/**
 * Utility function to draw a table row
 * @param {PDFDocument} doc - The pdfkit document instance
 * @param {number} y - The starting Y position
 * @param {string} key - The key/label text
 * @param {string} value - The value text
 * @param {number} keyWidth - Width of the key column
 */
const drawRow = (doc, y, key, value, keyWidth) => {
    // Define column coordinates (X positions)
    const keyX = 50; // Left Margin
    const valueX = keyX + keyWidth + 20; // Key end + spacing
    const docWidth = doc.page.width - doc.options.margin * 2;
    const valueWidth = docWidth - keyWidth - 20;

    // Set font for content
    doc.fontSize(10);
    
    // 🔑 NEW LOGIC: Check if the key is one of the important fields
    const importantFields = [
        "Name_of_the_barangay_officer",
        "Name_Of_the_bitten_Person",
        "location_of_bite"
    ];

    const isImportant = importantFields.includes(key);

    // Set font for the Key (Bold if important, normal otherwise)
    doc.font(isImportant ? 'Helvetica-Bold' : 'Helvetica')
       .text(key, keyX, y, { width: keyWidth, align: 'left' });
    
    // Draw Value (Normal font for data)
    doc.font('Helvetica').text(value, valueX, y, { width: valueWidth, align: 'left' });

    // Return the new Y position (reduced spacing now that the line is gone)
    return y + 16; 
};


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
    // 🔑 IMPORTANT: Using your specified logo path
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
    
    // 🔑 FONT FAMILY: Set the default font for the document
    doc.font('Helvetica'); 
    
    // Report title
    doc.fontSize(20).font('Helvetica-Bold').text("Incident Report", { align: "center" });
    doc.moveDown();

    // Category
    // REMOVED { underline: true } from the options
    doc.fontSize(14).font('Helvetica').text(`Category: ${report.type}`); 
    doc.moveDown(1.5);

    // ------------------------------------
    // 🔑 START: Dynamic Category Details in Table
    // ------------------------------------
    
    if (report.categoryDetails && Object.keys(report.categoryDetails).length > 0) {
      doc.fontSize(12).text("Report Details Table:");
      doc.moveDown(0.5);
        
      const keyColumnWidth = 150;
      let currentY = doc.y;

      // Draw Header Row (We keep this bold to distinguish the headers)
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333');
      doc.text("Field", 50, currentY, { width: keyColumnWidth });
      doc.text("Value", 50 + keyColumnWidth + 20, currentY, { width: 300 });
      doc.moveDown(0.5);
      
      // Draw a solid line under the header
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .strokeOpacity(1).stroke('#000000');
      
      currentY = doc.y + 5;
      
      doc.fillColor('#000000'); // Reset color for content
        
      Object.entries(report.categoryDetails).forEach(([key, val]) => {
          // Check for page break if content is too long
          if (currentY > doc.page.height - doc.options.margin * 2 - 50) {
              doc.addPage();
              currentY = doc.y;
          }
          
          currentY = drawRow(doc, currentY, key, val || "N/A", keyColumnWidth);
      });
      doc.moveDown(2); // Spacing after the table ends
    } else {
      doc.text("⚠️ No additional details available.");
      doc.moveDown();
    }
    
    // ------------------------------------
    // END: Dynamic Category Details in Table
    // ------------------------------------
    
    // Attached file handling
    if (report.filePath) {
      try {
        // Ensure image path is constructed correctly for the server's file system
        const imagePath = path.join(__dirname, "..", report.filePath); 
        
        if (fs.existsSync(imagePath)) { // Check file existence before trying to load
            doc.addPage(); // Start image on a new page for clarity
            doc.fontSize(16).font('Helvetica-Bold').text("Attached Image", { align: "center" });
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
