"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("Database connection error:", err));
app.use(express_1.default.json());
app.get('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query('SELECT * FROM products');
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.post('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price } = req.body;
    try {
        const result = yield pool.query('INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *', [name, description, price]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.put('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price } = req.body;
    try {
        const result = yield pool.query('UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *', [name, description, price, id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        }
        else {
            res.status(404).json({ error: 'Product not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.delete('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(204).send();
        }
        else {
            res.status(404).json({ error: 'Product not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
