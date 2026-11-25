const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pasta = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pasta),
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + extensao);
    }
});

// aceita somente imagens .jpeg/.jpg e .png
function fileFilter(req, file, cb) {
    const extensao = path.extname(file.originalname).toLowerCase();
    const extensoesValidas = ['.jpeg', '.jpg', '.png'];
    const tiposValidos = ['image/jpeg', 'image/png'];

    if (extensoesValidas.includes(extensao) && tiposValidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de imagem inválido! Envie apenas .jpeg ou .png'));
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single('imagem');

// middleware que devolve o erro do upload em JSON
function uploadImagem(req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'A imagem deve ter no máximo 2MB'
                : err.message;
            return res.status(422).json({ message });
        }
        next();
    });
}

function removerImagem(nomeArquivo) {
    if (!nomeArquivo) return;
    const caminho = path.join(pasta, nomeArquivo);
    if (fs.existsSync(caminho)) {
        fs.unlinkSync(caminho);
    }
}

module.exports = { uploadImagem, removerImagem };
