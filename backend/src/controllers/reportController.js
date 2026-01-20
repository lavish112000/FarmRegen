const PDFDocument = require('pdfkit');
const db = require('../config/db');
const axios = require('axios');
const logger = require('../utils/logger');

const reportController = {
    async generateReport(req, res) {
        try {
            const { analysisId } = req.params;
            const userId = req.user.id;

            // 1. Fetch Analysis & Field Data with new indices
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
            
            // Parse indices data if available
            let indices = null;
            if (data.indices_data) {
                indices = typeof data.indices_data === 'string' 
                    ? JSON.parse(data.indices_data) 
                    : data.indices_data;
            }

            // Fetch historical data for trend analysis
            const historyQuery = `
                SELECT analysis_date, soil_score, ndvi_mean, ndmi_mean
                FROM field_analyses
                WHERE field_id = $1
                ORDER BY analysis_date DESC
                LIMIT 10
            `;
            const historyResult = await db.query(historyQuery, [data.field_id]);
            const history = historyResult.rows;

            // 2. Setup PDF Stream
            const doc = new PDFDocument({ 
                margin: 50,
                size: 'A4',
                info: {
                    Title: `Soil Health Report - ${data.field_name}`,
                    Author: 'SoilSense Platform',
                    Subject: 'Agricultural Soil Analysis',
                    Keywords: 'soil, NDVI, agriculture, analysis'
                }
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=SoilReport_${data.field_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

            doc.pipe(res);

            // ============= PAGE 1: OVERVIEW =============
            
            // Header with logo-style branding
            doc.rect(0, 0, doc.page.width, 100).fill('#166534');
            doc.fontSize(28).fillColor('#ffffff').text('🌱 SoilSense', 50, 30);
            doc.fontSize(12).fillColor('#bbf7d0').text('Smart Soil Health Monitoring Platform', 50, 62);
            doc.fontSize(10).fillColor('#86efac').text(`Report Generated: ${new Date().toLocaleString()}`, 50, 78);

            // Report Title Section
            doc.moveDown(4);
            doc.fontSize(24).fillColor('#111827').text('Soil Health Analysis Report', 50, 130, { align: 'center' });
            doc.moveDown(0.5);
            
            // Field Info Box
            doc.roundedRect(50, 170, doc.page.width - 100, 70, 8).fill('#f3f4f6');
            doc.fontSize(14).fillColor('#374151').text(`Field: ${data.field_name}`, 70, 185);
            doc.fontSize(11).fillColor('#6b7280');
            doc.text(`📍 ${data.address || 'Location not specified'}`, 70, 205);
            doc.text(`📐 ${data.hectares ? data.hectares + ' hectares' : 'Area not calculated'}  |  📅 Analysis Date: ${new Date(data.analysis_date).toLocaleDateString()}`, 70, 222);

            // Score Section - Large circular score display
            const score = data.soil_score || 0;
            let scoreColor = '#dc2626'; // red
            let condition = 'Critical';
            let conditionBg = '#fef2f2';

            if (score >= 70) { 
                scoreColor = '#16a34a'; 
                condition = 'Excellent'; 
                conditionBg = '#f0fdf4';
            } else if (score >= 40) { 
                scoreColor = '#ca8a04'; 
                condition = 'Moderate'; 
                conditionBg = '#fefce8';
            }

            // Score card
            doc.roundedRect(50, 260, 200, 140, 10).fill(conditionBg);
            doc.roundedRect(55, 265, 190, 130, 8).stroke(scoreColor);
            doc.fontSize(12).fillColor('#6b7280').text('SOIL HEALTH SCORE', 60, 275, { width: 180, align: 'center' });
            doc.fontSize(48).fillColor(scoreColor).text(`${score}`, 60, 300, { width: 180, align: 'center' });
            doc.fontSize(14).fillColor('#9ca3af').text('/ 100', 145, 320);
            doc.fontSize(14).fillColor(scoreColor).text(condition, 60, 360, { width: 180, align: 'center' });

            // Vegetation Indices Cards (if available)
            if (indices || data.ndvi_mean) {
                const indicesStartX = 270;
                const indicesStartY = 260;
                const cardWidth = 120;
                const cardHeight = 65;
                const cardGap = 10;

                // NDVI Card
                doc.roundedRect(indicesStartX, indicesStartY, cardWidth, cardHeight, 6).fill('#f0fdf4');
                doc.fontSize(10).fillColor('#166534').text('NDVI', indicesStartX + 10, indicesStartY + 10);
                doc.fontSize(20).fillColor('#15803d').text(
                    (indices?.ndvi?.mean || data.ndvi_mean)?.toFixed(3) || 'N/A', 
                    indicesStartX + 10, indicesStartY + 28
                );
                doc.fontSize(8).fillColor('#6b7280').text('Vegetation Health', indicesStartX + 10, indicesStartY + 50);

                // NDMI Card
                doc.roundedRect(indicesStartX + cardWidth + cardGap, indicesStartY, cardWidth, cardHeight, 6).fill('#eff6ff');
                doc.fontSize(10).fillColor('#1e40af').text('NDMI', indicesStartX + cardWidth + cardGap + 10, indicesStartY + 10);
                doc.fontSize(20).fillColor('#1d4ed8').text(
                    (indices?.ndmi?.mean || data.ndmi_mean)?.toFixed(3) || 'N/A', 
                    indicesStartX + cardWidth + cardGap + 10, indicesStartY + 28
                );
                doc.fontSize(8).fillColor('#6b7280').text('Moisture Content', indicesStartX + cardWidth + cardGap + 10, indicesStartY + 50);

                // EVI Card
                doc.roundedRect(indicesStartX, indicesStartY + cardHeight + cardGap, cardWidth, cardHeight, 6).fill('#ecfdf5');
                doc.fontSize(10).fillColor('#047857').text('EVI', indicesStartX + 10, indicesStartY + cardHeight + cardGap + 10);
                doc.fontSize(20).fillColor('#059669').text(
                    (indices?.evi?.mean || data.evi_mean)?.toFixed(3) || 'N/A', 
                    indicesStartX + 10, indicesStartY + cardHeight + cardGap + 28
                );
                doc.fontSize(8).fillColor('#6b7280').text('Enhanced Vegetation', indicesStartX + 10, indicesStartY + cardHeight + cardGap + 50);

                // SAVI Card
                doc.roundedRect(indicesStartX + cardWidth + cardGap, indicesStartY + cardHeight + cardGap, cardWidth, cardHeight, 6).fill('#fffbeb');
                doc.fontSize(10).fillColor('#b45309').text('SAVI', indicesStartX + cardWidth + cardGap + 10, indicesStartY + cardHeight + cardGap + 10);
                doc.fontSize(20).fillColor('#d97706').text(
                    (indices?.savi?.mean || data.savi_mean)?.toFixed(3) || 'N/A', 
                    indicesStartX + cardWidth + cardGap + 10, indicesStartY + cardHeight + cardGap + 28
                );
                doc.fontSize(8).fillColor('#6b7280').text('Soil Adjusted', indicesStartX + cardWidth + cardGap + 10, indicesStartY + cardHeight + cardGap + 50);
            }

            // Moisture Status (if available)
            if (data.moisture_status || indices?.ndmi?.status) {
                const moistureStatus = data.moisture_status || indices?.ndmi?.status;
                let moistureColor = '#6b7280';
                if (moistureStatus === 'Adequate') moistureColor = '#16a34a';
                else if (moistureStatus === 'Moderate') moistureColor = '#0891b2';
                else if (moistureStatus === 'Low') moistureColor = '#ca8a04';
                else if (moistureStatus === 'Stressed') moistureColor = '#dc2626';

                doc.roundedRect(50, 415, 460, 30, 5).fill('#f9fafb');
                doc.fontSize(11).fillColor('#374151').text('💧 Moisture Status: ', 65, 423);
                doc.fillColor(moistureColor).text(moistureStatus, 175, 423);
            }

            // Satellite Image Section
            doc.moveDown(2);
            if (data.satellite_image_url && data.satellite_image_url.startsWith('data:')) {
                try {
                    doc.fontSize(14).fillColor('#111827').text('Satellite Analysis (NDVI Visualization)', 50, 460);
                    doc.moveDown(0.5);
                    
                    // Extract base64 data
                    const base64Data = data.satellite_image_url.split(',')[1];
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    
                    doc.image(imageBuffer, 50, 485, { fit: [doc.page.width - 100, 250] });
                    doc.fontSize(9).fillColor('#9ca3af').text('Source: Sentinel-2 Satellite Imagery | False Color NDVI Composite', 50, 745, { align: 'center' });
                } catch (imgError) {
                    logger.error('Error embedding image in PDF', { error: imgError.message });
                    doc.text('(Satellite image could not be loaded)', { align: 'center' });
                }
            } else if (data.satellite_image_url) {
                try {
                    const imageResponse = await axios.get(data.satellite_image_url, { responseType: 'arraybuffer', timeout: 10000 });
                    const imageBuffer = Buffer.from(imageResponse.data, 'binary');
                    
                    doc.fontSize(14).fillColor('#111827').text('Satellite Analysis (NDVI Visualization)', 50, 460);
                    doc.image(imageBuffer, 50, 485, { fit: [doc.page.width - 100, 250] });
                    doc.fontSize(9).fillColor('#9ca3af').text('Source: Sentinel-2 Satellite Imagery', 50, 745, { align: 'center' });
                } catch (imgError) {
                    logger.error('Error fetching image for PDF', { error: imgError.message });
                }
            }

            // ============= PAGE 2: DETAILED ANALYSIS =============
            doc.addPage();

            // Page header
            doc.rect(0, 0, doc.page.width, 50).fill('#166534');
            doc.fontSize(16).fillColor('#ffffff').text('Vegetation Indices Analysis', 50, 18);

            doc.moveDown(3);

            // Index Descriptions
            doc.fontSize(16).fillColor('#111827').text('Understanding Vegetation Indices', 50, 70);
            doc.moveDown();

            const indexDescriptions = [
                {
                    name: 'NDVI (Normalized Difference Vegetation Index)',
                    value: indices?.ndvi?.mean || data.ndvi_mean,
                    color: '#16a34a',
                    description: 'Measures the density and health of vegetation. Values range from -1 to 1, with higher values indicating denser, healthier vegetation.',
                    interpretation: 'Values > 0.6 indicate healthy dense vegetation, 0.2-0.6 moderate vegetation, < 0.2 sparse or stressed vegetation.'
                },
                {
                    name: 'NDMI (Normalized Difference Moisture Index)',
                    value: indices?.ndmi?.mean || data.ndmi_mean,
                    color: '#2563eb',
                    description: 'Indicates the water content in vegetation canopy. Useful for detecting water stress before visible symptoms appear.',
                    interpretation: 'Positive values indicate adequate moisture, near-zero indicates stress, negative values indicate severe water deficit.'
                },
                {
                    name: 'EVI (Enhanced Vegetation Index)',
                    value: indices?.evi?.mean || data.evi_mean,
                    color: '#059669',
                    description: 'An optimized vegetation index with improved sensitivity in high biomass regions and reduced atmospheric influences.',
                    interpretation: 'Better than NDVI for dense canopies. Values typically range 0-1, with higher values indicating more vigorous vegetation.'
                },
                {
                    name: 'SAVI (Soil Adjusted Vegetation Index)',
                    value: indices?.savi?.mean || data.savi_mean,
                    color: '#d97706',
                    description: 'Minimizes soil brightness influences, particularly useful in areas with sparse vegetation or exposed soil.',
                    interpretation: 'Best for early-season crops or areas with partial canopy cover. More accurate than NDVI when soil is visible.'
                }
            ];

            let yPos = 100;
            indexDescriptions.forEach((idx, i) => {
                doc.roundedRect(50, yPos, doc.page.width - 100, 90, 6).fillAndStroke('#fafafa', '#e5e7eb');
                
                // Index name and value
                doc.fontSize(12).fillColor(idx.color).text(idx.name, 60, yPos + 10);
                doc.fontSize(18).fillColor(idx.color).text(idx.value?.toFixed(4) || 'N/A', doc.page.width - 130, yPos + 10);
                
                // Description
                doc.fontSize(10).fillColor('#4b5563').text(idx.description, 60, yPos + 30, { width: doc.page.width - 150 });
                
                // Interpretation
                doc.fontSize(9).fillColor('#6b7280').text(`📊 ${idx.interpretation}`, 60, yPos + 60, { width: doc.page.width - 150 });
                
                yPos += 100;
            });

            // ============= PAGE 3: RECOMMENDATIONS =============
            doc.addPage();

            // Page header
            doc.rect(0, 0, doc.page.width, 50).fill('#166534');
            doc.fontSize(16).fillColor('#ffffff').text('Actionable Recommendations', 50, 18);

            doc.moveDown(3);

            // Generate recommendations based on score and indices
            doc.fontSize(16).fillColor('#111827').text('Based on Your Analysis', 50, 70);
            doc.moveDown();

            const recommendations = [];
            
            if (score >= 70) {
                recommendations.push(
                    { icon: '✅', title: 'Maintain Current Practices', text: 'Your vegetation indices are optimal. Continue current irrigation and fertilization schedules.' },
                    { icon: '🌿', title: 'Cover Cropping', text: 'Consider cover cropping post-harvest to retain soil structure and prevent erosion.' },
                    { icon: '🔍', title: 'Monitor for Pests', text: 'Dense canopy areas may harbor pest outbreaks. Regular scouting recommended.' }
                );
            } else if (score >= 40) {
                recommendations.push(
                    { icon: '💧', title: 'Check Irrigation', text: 'Vegetation shows moderate stress. Verify irrigation uniformity across the field.' },
                    { icon: '🧪', title: 'Soil Testing', text: 'Conduct a soil test for Nitrogen (N) or Potassium (K) deficiencies.' },
                    { icon: '📊', title: 'Precision Application', text: 'Use spot-treatment rather than blanket spraying to optimize input costs.' }
                );
            } else {
                recommendations.push(
                    { icon: '⚠️', title: 'Immediate Inspection Required', text: 'CRITICAL: Check for irrigation failure, severe disease, or pest infestation.' },
                    { icon: '🌱', title: 'Soil Health Priority', text: 'Soil organic matter may be critically low. Consider no-till practices next season.' },
                    { icon: '🔄', title: 'Remediation Options', text: 'Partial replanting may be necessary if early in the growth cycle.' }
                );
            }

            // Add moisture-specific recommendations
            if (data.moisture_status === 'Low' || data.moisture_status === 'Stressed') {
                recommendations.push(
                    { icon: '💧', title: 'Water Stress Detected', text: 'NDMI indicates water deficit. Increase irrigation frequency or check for drainage issues.' }
                );
            }

            let recY = 100;
            recommendations.forEach((rec, i) => {
                doc.roundedRect(50, recY, doc.page.width - 100, 60, 6).fill(i % 2 === 0 ? '#f0fdf4' : '#fefce8');
                doc.fontSize(24).text(rec.icon, 65, recY + 15);
                doc.fontSize(12).fillColor('#111827').text(rec.title, 100, recY + 12);
                doc.fontSize(10).fillColor('#4b5563').text(rec.text, 100, recY + 30, { width: doc.page.width - 170 });
                recY += 70;
            });

            // Historical Trend (if available)
            if (history.length > 1) {
                doc.moveDown(2);
                doc.fontSize(14).fillColor('#111827').text('📈 Historical Trend', 50, recY + 20);
                doc.fontSize(10).fillColor('#6b7280').text(`Based on ${history.length} analyses`, 50, recY + 40);
                
                // Simple text-based trend
                const latestScore = history[0]?.soil_score || 0;
                const previousScore = history[1]?.soil_score || 0;
                const trend = latestScore - previousScore;
                
                doc.fontSize(12).fillColor(trend >= 0 ? '#16a34a' : '#dc2626');
                doc.text(`Score Trend: ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)} points from previous analysis`, 50, recY + 60);
            }

            // Did You Know Section
            doc.moveDown(4);
            const factY = doc.y;
            doc.roundedRect(50, factY, doc.page.width - 100, 100, 10).fill('#ecfdf5');
            doc.fontSize(14).fillColor('#065f46').text('💡 Did You Know?', 70, factY + 15);
            doc.fontSize(10).fillColor('#064e3b').text(
                'Regenerative agriculture practices like no-till and cover cropping can sequester up to 1.5 tons of CO₂ per acre annually. Farms focusing on soil health often see profitability increase by $100-$200 per acre due to reduced input costs.',
                70, factY + 40,
                { width: doc.page.width - 140 }
            );
            doc.fontSize(9).fillColor('#6b7280').text('Source: Rodale Institute / USDA', 70, factY + 80);

            // Footer on all pages
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                
                // Footer line
                doc.moveTo(50, doc.page.height - 60).lineTo(doc.page.width - 50, doc.page.height - 60).stroke('#e5e7eb');
                
                // Footer text
                doc.fontSize(8).fillColor('#9ca3af').text(
                    `SoilSense | ${data.field_name} | Generated ${new Date().toLocaleDateString()}`,
                    50,
                    doc.page.height - 45,
                    { align: 'left', width: doc.page.width - 150 }
                );
                doc.text(
                    `Page ${i + 1} of ${range.count}`,
                    doc.page.width - 100,
                    doc.page.height - 45,
                    { align: 'right' }
                );
            }

            doc.end();

        } catch (error) {
            logger.error('Report Generation Error', { error: error.message, stack: error.stack });
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to generate report' });
            }
        }
    }
};

module.exports = reportController;
