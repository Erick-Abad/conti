const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static(path.join(__dirname, '..', 'Nuevo'))); // Cambiar esta línea para servir archivos estáticos

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send-email', upload.single('file'), (req, res, next) => {
    const { date } = req.body;

    if (!req.file || !date) {
        const error = new Error('Faltan datos requeridos');
        error.status = 400;
        return next(error);
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'albertomonserrate342@gmail.com',
        subject: `Envio de exportacion bardcore del dia ${date}`,
        text: 'Adjunto encontrará el archivo de exportación.',
        attachments: [
            {
                filename: `export_${date}.xlsx`,
                content: req.file.buffer
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return next(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Correo enviado con éxito');
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Nuevo', 'index.html')); // Asegurarse de que se sirva el archivo index.html
});

app.use((err, req, res, next) => {
    console.error('Error general:', err.message);
    res.status(err.status || 500).send(err.message || 'Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});