import os
import json
import zipfile
import mimetypes
import logging
from datetime import datetime
from pathlib import Path
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from flask import Flask, request, redirect, url_for, render_template, flash, send_file, jsonify, abort
from flask_cors import CORS

# Document processing imports with proper error handling
try:
    import fitz  # PyMuPDF for PDF processing
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    import openpyxl
    EXCEL_AVAILABLE = True
except ImportError:
    EXCEL_AVAILABLE = False

# Logging setup
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-change-in-production")
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
MAX_CONTENT_LENGTH = 10 * 1024 * 1024 * 1024  # 10GB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'ico'},
    'documents': {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'},
    'videos': {'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'},
    'audio': {'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'},
    'archives': {'zip', 'rar', '7z', 'tar', 'gz', 'bz2'}
}

def allowed_file(filename):
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return any(ext in exts for exts in ALLOWED_EXTENSIONS.values())

def get_file_type(filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    for type_, exts in ALLOWED_EXTENSIONS.items():
        if ext in exts:
            return type_
    return 'other'

def extract_text_from_file(file_path):
    try:
        ext = Path(file_path).suffix.lower()
        if ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        elif ext == '.pdf' and PDF_AVAILABLE:
            with fitz.open(file_path) as doc:
                return "\n".join([page.get_text() for page in doc])
        elif ext == '.docx' and DOCX_AVAILABLE:
            doc = Document(file_path)
            text = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            return '\n'.join(text)
        elif ext == '.xlsx' and EXCEL_AVAILABLE:
            wb = openpyxl.load_workbook(file_path)
            text = []
            for sheet in wb.worksheets:
                text.append(f"=== Sheet: {sheet.title} ===")
                for row in sheet.iter_rows(values_only=True):
                    text.append('\t'.join([str(cell) if cell else '' for cell in row]))
            wb.close()
            return '\n'.join(text)
        return "Preview not available for this file type."
    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        return f"Error: {str(e)}"

@app.route("/")
def index():
    return "Unified InventoryMaster API is running."

@app.route("/upload", methods=['POST'])
def upload():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return "Invalid or missing file", 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    counter = 1
    while os.path.exists(save_path):
        base, ext = os.path.splitext(filename)
        filename = f"{base}_{counter}{ext}"
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        counter += 1

    file.save(save_path)
    logger.info(f"Uploaded file saved to {save_path}")
    return f"File {filename} uploaded successfully."

@app.route("/preview/<path:filename>")
def preview_file(filename):
    path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(path):
        return f"File {filename} not found.", 404
    return extract_text_from_file(path)

@app.errorhandler(RequestEntityTooLarge)
def handle_large(e):
    return "File too large. Max 10GB.", 413

if __name__ == '__main__':
    app.run(debug=True)
