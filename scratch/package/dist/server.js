"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const core_1 = require("./core");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/to-unicode', (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
    }
    res.json({ converted: (0, core_1.bijoyToUnicode)(text) });
});
app.post('/to-ansi', (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
    }
    res.json({ converted: (0, core_1.unicodeToBijoy)(text) });
});
// For Excel WEBSERVICE support
app.get('/api/convert', (req, res) => {
    const text = req.query.text;
    const type = req.query.type;
    if (!text) {
        res.send("");
        return;
    }
    if (type === 'u2b') {
        res.send((0, core_1.unicodeToBijoy)(text));
    }
    else {
        res.send((0, core_1.bijoyToUnicode)(text));
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
