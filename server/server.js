const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const app = express();
const port = 3000;

// Разрешаем запросы с фронтенда
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// База данных товаров (минимум 10 товаров)
let products = [
    { id: nanoid(6), name: "Футбольный мяч", category: "Мячи", description: "Профессиональный мяч для футбола", price: 2500, stock: 15, rating: 4.5 },
    { id: nanoid(6), name: "Баскетбольный мяч", category: "Мячи", description: "Мяч для баскетбола, размер 7", price: 3200, stock: 8, rating: 4.7 },
    { id: nanoid(6), name: "Беговые кроссовки", category: "Обувь", description: "Кроссовки для бега, размер 42", price: 5500, stock: 12, rating: 4.8 },
    { id: nanoid(6), name: "Теннисная ракетка", category: "Ракетки", description: "Профессиональная ракетка для тенниса", price: 8900, stock: 5, rating: 4.6 },
    { id: nanoid(6), name: "Гантели 5 кг", category: "Гантели", description: "Пара гантелей по 5 кг", price: 2100, stock: 20, rating: 4.4 },
    { id: nanoid(6), name: "Скакалка", category: "Аксессуары", description: "Профессиональная скакалка", price: 450, stock: 30, rating: 4.3 },
    { id: nanoid(6), name: "Коврик для йоги", category: "Аксессуары", description: "Противоскользящий коврик", price: 1200, stock: 14, rating: 4.6 },
    { id: nanoid(6), name: "Боксерские перчатки", category: "Бокс", description: "Перчатки 12 унций", price: 3500, stock: 7, rating: 4.9 },
    { id: nanoid(6), name: "Велосипед", category: "Транспорт", description: "Горный велосипед 26 дюймов", price: 18500, stock: 3, rating: 4.8 },
    { id: nanoid(6), name: "Шлем велосипедный", category: "Защита", description: "Защитный шлем для велоспорта", price: 2800, stock: 9, rating: 4.5 },
    { id: nanoid(6), name: "Лыжи", category: "Зимний спорт", description: "Горные лыжи с креплениями", price: 12500, stock: 2, rating: 4.7 },
    { id: nanoid(6), name: "Палатка", category: "Туризм", description: "Трехместная палатка", price: 8900, stock: 4, rating: 4.5 }
];

// Функция-помощник для поиска товара
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// GET /api/products - получить все товары
app.get("/api/products", (req, res) => {
    res.json(products);
});

// GET /api/products/:id - получить товар по ID
app.get("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

// POST /api/products - создать новый товар
app.post("/api/products", (req, res) => {
    const { name, category, description, price, stock, rating } = req.body;
    
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating ? Number(rating) : 0
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH /api/products/:id - обновить товар
app.patch("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    
    // Проверяем, есть ли что обновлять
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Nothing to update" });
    }
    
    const { name, category, description, price, stock, rating } = req.body;
    
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    
    res.json(product);
});

// DELETE /api/products/:id - удалить товар
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });
    
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log('Доступные маршруты:');
    console.log('GET /api/products - все товары');
    console.log('GET /api/products/:id - товар по ID');
    console.log('POST /api/products - создать товар');
    console.log('PATCH /api/products/:id - обновить товар');
    console.log('DELETE /api/products/:id - удалить товар');
});