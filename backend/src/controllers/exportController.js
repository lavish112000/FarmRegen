const db = require('../config/db');
const XLSX = require('xlsx');
const logger = require('../utils/logger');

const exportController = {
    /**
     * Export analysis history as CSV
     */
    async exportCSV(req, res) {
        try {
            const userId = req.user.id;
            const { fieldId } = req.query;

            let query = `
                SELECT 
                    f.name as field_name,
                    f.hectares,
                    fa.analysis_date,
                    fa.ndvi_mean,
                    fa.ndvi_stddev,
                    fa.ndmi_mean,
                    fa.evi_mean,
                    fa.savi_mean,
                    fa.soil_score,
                    fa.moisture_status
                FROM field_analyses fa
                JOIN fields f ON fa.field_id = f.id
                WHERE f.user_id = $1
            `;
            const params = [userId];

            if (fieldId) {
                query += ' AND fa.field_id = $2';
                params.push(fieldId);
            }

            query += ' ORDER BY fa.analysis_date DESC';

            const result = await db.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No analysis data found' });
            }

            // Build CSV content
            const headers = [
                'Field Name',
                'Hectares',
                'Analysis Date',
                'NDVI Mean',
                'NDVI Std Dev',
                'NDMI Mean',
                'EVI Mean',
                'SAVI Mean',
                'Soil Score',
                'Moisture Status'
            ];

            const rows = result.rows.map(row => [
                row.field_name,
                row.hectares || '',
                new Date(row.analysis_date).toISOString().split('T')[0],
                row.ndvi_mean?.toFixed(4) || '',
                row.ndvi_stddev?.toFixed(4) || '',
                row.ndmi_mean?.toFixed(4) || '',
                row.evi_mean?.toFixed(4) || '',
                row.savi_mean?.toFixed(4) || '',
                row.soil_score || '',
                row.moisture_status || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=analysis_export_${Date.now()}.csv`);
            res.send(csvContent);

            logger.info('CSV export completed', { userId, rowCount: rows.length });

        } catch (error) {
            logger.error('CSV export failed', { error: error.message });
            res.status(500).json({ message: 'Export failed' });
        }
    },

    /**
     * Export analysis history as Excel (XLSX)
     */
    async exportExcel(req, res) {
        try {
            const userId = req.user.id;
            const { fieldId } = req.query;

            let query = `
                SELECT 
                    f.name as field_name,
                    f.hectares,
                    f.address,
                    fa.analysis_date,
                    fa.ndvi_mean,
                    fa.ndvi_stddev,
                    fa.ndmi_mean,
                    fa.evi_mean,
                    fa.savi_mean,
                    fa.soil_score,
                    fa.moisture_status,
                    fa.indices_data
                FROM field_analyses fa
                JOIN fields f ON fa.field_id = f.id
                WHERE f.user_id = $1
            `;
            const params = [userId];

            if (fieldId) {
                query += ' AND fa.field_id = $2';
                params.push(fieldId);
            }

            query += ' ORDER BY fa.analysis_date DESC';

            const result = await db.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No analysis data found' });
            }

            // Transform data for Excel
            const data = result.rows.map(row => ({
                'Field Name': row.field_name,
                'Hectares': row.hectares,
                'Address': row.address || '',
                'Analysis Date': new Date(row.analysis_date).toLocaleDateString(),
                'NDVI Mean': row.ndvi_mean ? parseFloat(row.ndvi_mean.toFixed(4)) : null,
                'NDVI Std Dev': row.ndvi_stddev ? parseFloat(row.ndvi_stddev.toFixed(4)) : null,
                'NDMI Mean': row.ndmi_mean ? parseFloat(row.ndmi_mean.toFixed(4)) : null,
                'EVI Mean': row.evi_mean ? parseFloat(row.evi_mean.toFixed(4)) : null,
                'SAVI Mean': row.savi_mean ? parseFloat(row.savi_mean.toFixed(4)) : null,
                'Soil Health Score': row.soil_score,
                'Moisture Status': row.moisture_status || ''
            }));

            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Main data sheet
            const worksheet = XLSX.utils.json_to_sheet(data);
            
            // Set column widths
            worksheet['!cols'] = [
                { wch: 20 }, // Field Name
                { wch: 10 }, // Hectares
                { wch: 30 }, // Address
                { wch: 15 }, // Analysis Date
                { wch: 12 }, // NDVI Mean
                { wch: 12 }, // NDVI Std Dev
                { wch: 12 }, // NDMI Mean
                { wch: 12 }, // EVI Mean
                { wch: 12 }, // SAVI Mean
                { wch: 15 }, // Soil Score
                { wch: 15 }  // Moisture Status
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Data');

            // Summary sheet
            const summaryData = [
                { Metric: 'Total Analyses', Value: result.rows.length },
                { Metric: 'Average NDVI', Value: (result.rows.reduce((sum, r) => sum + (r.ndvi_mean || 0), 0) / result.rows.length).toFixed(4) },
                { Metric: 'Average Soil Score', Value: Math.round(result.rows.reduce((sum, r) => sum + (r.soil_score || 0), 0) / result.rows.length) },
                { Metric: 'Export Date', Value: new Date().toLocaleDateString() },
                { Metric: 'Generated By', Value: 'SoilSense Platform' }
            ];
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=analysis_export_${Date.now()}.xlsx`);
            res.send(buffer);

            logger.info('Excel export completed', { userId, rowCount: data.length });

        } catch (error) {
            logger.error('Excel export failed', { error: error.message });
            res.status(500).json({ message: 'Export failed' });
        }
    },

    /**
     * Export single field's analysis history
     */
    async exportFieldAnalysis(req, res) {
        try {
            const userId = req.user.id;
            const { fieldId } = req.params;
            const { format = 'csv' } = req.query;

            // Verify field belongs to user
            const fieldCheck = await db.query(
                'SELECT id, name FROM fields WHERE id = $1 AND user_id = $2',
                [fieldId, userId]
            );

            if (fieldCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Field not found' });
            }

            const fieldName = fieldCheck.rows[0].name;

            // Get all analyses for this field
            const result = await db.query(
                `SELECT 
                    analysis_date,
                    ndvi_mean,
                    ndvi_stddev,
                    ndmi_mean,
                    evi_mean,
                    savi_mean,
                    soil_score,
                    moisture_status
                FROM field_analyses
                WHERE field_id = $1
                ORDER BY analysis_date DESC`,
                [fieldId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No analysis data found for this field' });
            }

            if (format === 'xlsx') {
                // Excel format
                const data = result.rows.map(row => ({
                    'Date': new Date(row.analysis_date).toLocaleDateString(),
                    'NDVI': row.ndvi_mean ? parseFloat(row.ndvi_mean.toFixed(4)) : null,
                    'NDMI': row.ndmi_mean ? parseFloat(row.ndmi_mean.toFixed(4)) : null,
                    'EVI': row.evi_mean ? parseFloat(row.evi_mean.toFixed(4)) : null,
                    'SAVI': row.savi_mean ? parseFloat(row.savi_mean.toFixed(4)) : null,
                    'Score': row.soil_score,
                    'Moisture': row.moisture_status || ''
                }));

                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(workbook, worksheet, fieldName.substring(0, 31));

                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${fieldName.replace(/\s+/g, '_')}_analysis.xlsx`);
                res.send(buffer);
            } else {
                // CSV format
                const headers = ['Date', 'NDVI', 'NDMI', 'EVI', 'SAVI', 'Score', 'Moisture'];
                const rows = result.rows.map(row => [
                    new Date(row.analysis_date).toISOString().split('T')[0],
                    row.ndvi_mean?.toFixed(4) || '',
                    row.ndmi_mean?.toFixed(4) || '',
                    row.evi_mean?.toFixed(4) || '',
                    row.savi_mean?.toFixed(4) || '',
                    row.soil_score || '',
                    row.moisture_status || ''
                ]);

                const csvContent = [
                    headers.join(','),
                    ...rows.map(row => row.join(','))
                ].join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${fieldName.replace(/\s+/g, '_')}_analysis.csv`);
                res.send(csvContent);
            }

            logger.info('Field analysis export completed', { userId, fieldId, format });

        } catch (error) {
            logger.error('Field analysis export failed', { error: error.message });
            res.status(500).json({ message: 'Export failed' });
        }
    }
};

module.exports = exportController;
