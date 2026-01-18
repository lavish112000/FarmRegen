const PDFDocument = require('pdfkit');
const db = require('../config/db');
const axios = require('axios');

const reportController = {
    async generateReport(req, res) {
        try {
            const { analysisId } = req.params;
            const userId = req.user.id;

            // 1. Fetch Analysis & Field Data
            const query = `
                SELECT fa.*, f.name as field_name, f.hectares, f.address, f.boundary 
                FROM field_analyses fa
                JOIN fields f ON fa.field_id = f.id
                WHERE fa.id = $1 AND f.user_id = $2
            `;
            const result = await db.query(query, [analysisId, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Analysis not found' });
            }

            const data = result.rows[0];

            // 2. Setup PDF Stream
            const doc = new PDFDocument({ margin: 50 });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=SoilReport_${data.field_name.replace(/\s+/g, '_')}.pdf`);

            doc.pipe(res);

            // 3. Header
            doc.fontSize(20).fillColor('#166534').text('SoilSense', { align: 'left' });
            doc.fontSize(10).fillColor('#666').text('Smart Soil Health Monitoring', { align: 'left' });
            doc.moveDown();

            doc.moveTo(50, 80).lineTo(550, 80).strokeColor('#ddd').stroke();
            doc.moveDown(2);

            // 4. Report Title & Meta
            doc.fontSize(24).fillColor('#111').text('Soil Health Analysis Report', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).fillColor('#444');
            doc.text(`Field Name: ${data.field_name}`, { align: 'center' });
            doc.text(`Date of Analysis: ${new Date(data.analysis_date).toLocaleDateString()}`, { align: 'center' });
            doc.moveDown(2);

            // 5. Score Section
            const score = data.soil_score || 0;
            let color = '#dc2626'; // red
            let condition = 'Critical';

            if (score > 70) { color = '#16a34a'; condition = 'Excellent'; } // green
            else if (score > 40) { color = '#ca8a04'; condition = 'Moderate'; } // yellow

            doc.roundedRect(50, 200, 510, 100, 10).fill('#f9fafb');

            doc.fontSize(14).fillColor('#6b7280').text('Overall Soil Health Score', 50, 220, { align: 'center', width: 510 });
            doc.fontSize(36).fillColor(color).text(`${score} / 100`, 50, 240, { align: 'center', width: 510 });
            doc.fontSize(16).fillColor(color).text(`${condition} Condition`, 50, 280, { align: 'center', width: 510 });

            doc.moveDown(4);

            // 6. Satellite Imagery
            if (data.satellite_image_url) {
                try {
                    // Fetch image buffer
                    const imageResponse = await axios.get(data.satellite_image_url, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

                    doc.text('Satellite Analysis (NDVI)', 50, doc.y + 20, { align: 'left' });
                    doc.moveDown(0.5);
                    // Center the image
                    doc.image(imageBuffer, { fit: [500, 300], align: 'center' });
                    doc.moveDown();
                    doc.fontSize(10).fillColor('#999').text('Source: Sentinel-2 Satellite Imagery (False Color NDVI)', { align: 'center' });
                } catch (imgError) {
                    console.error('Error fetching image for PDF', imgError);
                    doc.text('(Satellite image could not be loaded)', { align: 'center' });
                }
            }

            doc.moveDown(2);

            // 7. Legend & Interpretation
            doc.addPage();
            doc.fontSize(18).fillColor('#111').text('Understanding Your Analysis', { underline: true });
            doc.moveDown();

            doc.fontSize(12).fillColor('#333').text('The Soil Health Score is derived from NDVI (Normalized Difference Vegetation Index) satellite data, adjusted for vegetation uniformity. Higher scores indicate denser, healthier green biomass.');
            doc.moveDown();

            // Legend Table
            const startX = 50;
            const startY = doc.y;

            doc.rect(startX, startY, 500, 100).stroke('#ddd');

            doc.fontSize(10).fillColor('#000');
            doc.text('Score Range', startX + 10, startY + 10, { bold: true });
            doc.text('Interpretation', startX + 150, startY + 10, { bold: true });
            doc.text('Typical Condition', startX + 350, startY + 10, { bold: true });

            doc.moveTo(startX, startY + 25).lineTo(startX + 500, startY + 25).stroke('#eee');

            // Row 1
            doc.fillColor('#16a34a').text('70 - 100', startX + 10, startY + 35);
            doc.text('Dense, healthy vegetation. Peak photosynthesis.', startX + 150, startY + 35, { width: 180 });
            doc.text('Excellent', startX + 350, startY + 35);

            // Row 2
            doc.fillColor('#ca8a04').text('40 - 69', startX + 10, startY + 55);
            doc.text('Moderate cover. Potential water/nutrient stress.', startX + 150, startY + 55, { width: 180 });
            doc.text('Good / Moderate', startX + 350, startY + 55);

            // Row 3
            doc.fillColor('#dc2626').text('0 - 39', startX + 10, startY + 75);
            doc.text('Bare soil, dead vegetation, or inorganic material.', startX + 150, startY + 75, { width: 180 });
            doc.text('Critical / Bare', startX + 350, startY + 75);

            doc.moveDown(4);

            // 8. Recommendations
            doc.fontSize(18).fillColor('#111').text('Actionable Recommendations', { underline: true });
            doc.moveDown();

            doc.fontSize(12).fillColor('#333');
            if (score > 70) {
                doc.list([
                    'Vegetation indices are optimal. Maintain current irrigation and fertilization.',
                    'Conservation: Consider cover cropping post-harvest to retain soil structure.',
                    'Monitoring: Watch for localized pest outbreaks in dense canopy areas.'
                ], { bulletRadius: 2 });
            } else if (score > 40) {
                doc.list([
                    'Vegetation shows moderate stress. Check for irrigation uniformity.',
                    'Nutrients: Conduct a soil test for Nitrogen (N) or Potassium (K) deficiencies.',
                    'Comparison: Compare this map with elevation data to check for water runoff.',
                    'Action: Apply spot-treatment rather than blanket spraying to save costs.'
                ], { bulletRadius: 2 });
            } else {
                doc.list([
                    'CRITICAL: Significant stress or bare soil detected.',
                    'Immediate Inspection: Check for irrigation failure, severe disease, or pest infestation.',
                    'Soil Health: Soil organic matter may be critically low. Consider no-till practices next season.',
                    'Remediation: Partial replanting may be necessary if early in the growth cycle.'
                ], { bulletRadius: 2 });
            }

            doc.moveDown(3);

            // 9. Facts Section
            doc.rect(50, doc.y, 500, 80).fill('#ecfdf5');
            doc.fillColor('#065f46').fontSize(14).text('Did You Know?', 70, doc.y - 65);
            doc.fillColor('#064e3b').fontSize(10).text(
                'Regenerative agriculture practices like no-till and cover cropping can sequester up to 1.5 tons of CO2 per acre annually. Farms focusing on soil health often see profitability increase by $100-$200 per acre due to reduced input costs. (Source: Rodale Institute / USDA)',
                70,
                doc.y + 10,
                { width: 460 }
            );

            // Footer
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#aaa').text(
                    `Generated by SoilSense on ${new Date().toLocaleDateString()}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
            }

            doc.end();

        } catch (error) {
            console.error('Report Generation Error:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to generate report' });
            }
        }
    }
};

module.exports = reportController;
