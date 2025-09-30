const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs"); 
const Report = require("../model/reportsmodel"); // Assuming this is the Report model

/**
 * Utility function to draw a table row
 * @param {PDFDocument} doc - The pdfkit document instance
 * @param {number} y - The starting Y position
 * @param {string} key - The key/label text (before formatting)
 * @param {string} value - The value text
 * @param {number} keyWidth - Width of the key column
 */
const drawRow = (doc, y, key, value, keyWidth) => {
    // Define column coordinates (X positions)
    const keyX = 50; // Left Margin
    const valueX = keyX + keyWidth + 20; // Key end + spacing
    const docWidth = doc.page.width - doc.options.margin * 2;
    const valueWidth = docWidth - keyWidth - 20;
    const lineGap = 4; // Spacing between lines of wrapped text

    // Set font size for content
    doc.fontSize(12);
    
    // 🔑 IMPORTANT FIELDS LIST: Fields to display as bold
    const importantFields = [
        "Name_of_the_barangay_officer",
        "Name_Of_the_bitten_Person",
        "location_of_bite",
        "barangayId",
        "animalType",
        "color",
        "size",
        "location",
        "street",
        "age",
        "gender",
        "severity",
        "caughtStatus",
        "breed",
        "Time",
        "bahavior",
        "reportDate",
        "Special",
    ];

    const isImportant = importantFields.includes(key);

    // 🔑 CUSTOM DISPLAY NAMES: Map machine keys to human-readable names
    const displayMap = {
        "barangayId": "Barangay",
        "animalType": "Animal Type",
        "color":"Color",
        "size": "Size",
        "age":"Age",
        "gender":"Gender",
        "severity":"Severity",
        "caughtStatus":"Caught Status",
        "bahavior": "Behavior",
        "breed":"Breed",
        "reportDate": "Report Date",
        "location_of_bite" : "Location Of Bite",
        "street":"Street",
        "Name_Of_the_bitten_Person": "Name Of The Bitten Person",
        "Name_of_the_barangay_officer":"Name Of The Barangay Officer" // Removed leading space
    };
    
    // 🔑 CORE CHANGE: Format the key for display
    let formattedKey = displayMap[key] || key.replace(/_/g, ' ');

    // --- CRITICAL FIX START: Draw Key and Value without overlap ---

    // 1. Draw Key (Left Column)
    // Temporarily store the cursor Y position
    const startY = y; 

    // Set font for the Key (Bold if important, normal otherwise)
    doc.font(isImportant ? 'Helvetica-Bold' : 'Helvetica')
       .text(formattedKey, keyX, startY, { 
           width: keyWidth, 
           align: 'left',
           lineGap: lineGap 
       });
    
    // Height of the key text
    const keyHeight = doc.y - startY; 

    // 2. Draw Value (Right Column)
    // CRITICAL: Reset the cursor Y position to the original starting Y
    doc.y = startY; 
    
    // Draw Value (Non-bold font for data, this matches your output image)
    doc.font('Helvetica')
       .text(value, valueX, startY, { 
           width: valueWidth, 
           align: 'left',
           lineGap: lineGap 
       });
    
    // Height of the value text
    const valueHeight = doc.y - startY; 

    // 3. Determine the next starting Y position
    const nextY = startY + Math.max(keyHeight, valueHeight) + 5; // Add a small gap (5 units)

    // CRITICAL: Set the document's cursor Y to the next starting point
    doc.y = nextY; 
    
    // Return the new Y position
    return nextY; 
    // --- CRITICAL FIX END ---
};


const downloadReport = async (req, res) => {
    try {
        // Use .populate() to retrieve the linked Barangay document
        const report = await Report.findById(req.params.id)
            .populate({ path: 'barangayId', select: 'name' }) 
            .exec(); 

        if (!report) {
            return res.status(404).send("Report not found");
        }
        
        const doc = new PDFDocument({ margin: 50 });
        
        // DOWNLOAD SETUP: Set headers to signal a file download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=report-${report._id}.pdf`
        );

        // CORE CHANGE: Pipe the document stream directly to the response
        doc.pipe(res);
        
        // --- START: Logo in Header Section ---
        const logoPath = path.join(__dirname, '..', 'assets', 'Vaccibitelogo.png'); 

        if (fs.existsSync(logoPath)) {
            // Place image on the left side, slightly lower than top margin (50)
            doc.image(logoPath, 50, 50, { width: 80, height: 80}); 
            // Reset cursor Y position after image insertion for text to start below
            doc.y = 100; 
        } else {
            doc.moveDown(0.5); // Maintain some top spacing if no logo
            console.warn("PDF generation warning: Logo image not found at expected path.");
        }
        // --- END: Logo in Header Section ---
        
        // Set the default font for the document (can be overridden)
        doc.font('Helvetica-Bold'); 
        
        // Report title
        // NOTE: The x-position of the text is relative to the logo's position if not specified.
        doc.fontSize(20).text("Incident Report", { align: "center" });
        doc.moveDown();

        // Category
        // Use non-bold font for the category line to look better
        doc.fontSize(12).font('Helvetica').text(`Category: ${report.type}`); 
        doc.moveDown(0.5);

        // Barangay Name Logic
        const barangayName = report.barangayId && report.barangayId.name 
            ? report.barangayId.name 
            : (report.barangayId ? `ID: ${report.barangayId._id || report.barangayId}` : 'N/A');
        
        // Use non-bold font for the barangay name
        doc.fontSize(12).font('Helvetica').text(`Barangay: ${barangayName}`);
        doc.moveDown(1); // Add extra space before table starts

        // ------------------------------------
        // START: Dynamic Category Details in Table
        // ------------------------------------
        
        if (report.categoryDetails && Object.keys(report.categoryDetails).length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text("Report Details Table:");
            doc.moveDown(0.5);
            
            const keyColumnWidth = 150;
            let currentY = doc.y;

            // Draw Header Row 
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333');
            // Explicitly set the Y position for the header text to avoid issues
            const headerY = doc.y;
            doc.text("Field", 50, headerY, { width: keyColumnWidth });
            doc.text("Value", 50 + keyColumnWidth + 20, headerY, { width: 300 });
            doc.moveDown(0.5);
            
            // Draw a solid line under the header
            doc.moveTo(50, doc.y)
                .lineTo(doc.page.width - 50, doc.y)
                .strokeOpacity(1).stroke('#000000');
            
            currentY = doc.y + 5;
            
            doc.fillColor('#000000'); // Reset color for content
            
        Object.entries(report.categoryDetails).forEach(([key, val]) => {
            // Replace barangayId with barangayName for display
            if (key === "barangayId") {
                val = report.barangayId && report.barangayId.name 
                    ? report.barangayId.name   // show name if populated
                    : "N/A";                   // fallback if missing
            }

            // Check for page break if content is too long
            if (currentY > doc.page.height - doc.options.margin * 2 - 50) {
                doc.addPage();
                currentY = doc.y;
            }

            // The drawRow function now handles setting doc.y correctly
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
        
        // Final element to flush the document and send the response
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


