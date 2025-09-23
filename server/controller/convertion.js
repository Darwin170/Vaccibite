const PDFDocument = require("pdfkit");
const path = require("path");
const Report = require("../model/reportsmodel");

const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).send("Report not found");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${report._id}.pdf`
    );

    doc.pipe(res);

    // Report title
    doc.fontSize(20).text("Incident Report", { align: "center" });
    doc.moveDown();

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

    if (report.filePath) {
      try {
        
        doc.fontSize(16).text("Attached Image", { align: "center" });
        doc.moveDown();

        const imagePath = path.join(__dirname, "..", report.filePath);
        doc.image(imagePath, {
          fit: [400, 400],
          align: "center",
          valign: "center",
        });
      } catch (err) {
        console.error("Image error:", err);
        doc.text("⚠️ Could not load image.");
      }
    }

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).send("Error generating report");
  }
};

module.exports = { downloadReport };
