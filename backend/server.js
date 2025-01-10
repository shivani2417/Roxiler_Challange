// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mernStackChallenge', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Schema and Model
const transactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    category: String,
    dateOfSale: Date,
    sold: Boolean,
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Initialize Database API
app.get('/api/init', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        await Transaction.deleteMany(); // Clear previous data
        await Transaction.insertMany(data); // Seed new data

        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// List Transactions API
app.get('/api/transactions', async (req, res) => {
    const { search = '', page = 1, perPage = 10, month } = req.query;

    const query = {};
    if (month) {
        const startDate = new Date(`${month} 1, 2000`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);
        query.dateOfSale = { $gte: startDate, $lt: endDate };
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: { $regex: search, $options: 'i' } },
        ];
    }

    try {
        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        res.status(200).json({ total, transactions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Statistics API
app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;

    try {
        const startDate = new Date(`${month} 1, 2000`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const totalSaleAmount = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: null, total: { $sum: '$price' } } },
        ]);

        const soldItems = await Transaction.countDocuments({
            dateOfSale: { $gte: startDate, $lt: endDate },
            sold: true,
        });

        const notSoldItems = await Transaction.countDocuments({
            dateOfSale: { $gte: startDate, $lt: endDate },
            sold: false,
        });

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.total || 0,
            soldItems,
            notSoldItems,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Bar Chart API
app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;

    try {
        const startDate = new Date(`${month} 1, 2000`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity },
        ];

        const result = await Promise.all(
            priceRanges.map(async ({ range, min, max }) => {
                const count = await Transaction.countDocuments({
                    dateOfSale: { $gte: startDate, $lt: endDate },
                    price: { $gte: min, $lt: max === Infinity ? Infinity : max },
                });
                return { range, count };
            })
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
});

// Pie Chart API
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;

    try {
        const startDate = new Date(`${month} 1, 2000`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const categories = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
});

// Combined API
app.get('/api/combined', async (req, res) => {
    try {
        const statistics = await axios.get('/api/statistics', { params: req.query });
        const barChart = await axios.get('/api/bar-chart', { params: req.query });
        const pieChart = await axios.get('/api/pie-chart', { params: req.query });

        res.status(200).json({
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});