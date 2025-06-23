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

try:
    from pptx import Presentation
    PPTX_AVAILABLE = True
except ImportError:
    PPTX_AVAILABLE = False

try:
    from odf.opendocument import load
    from odf.text import P
    from odf.teletype import extractText
    ODF_AVAILABLE = True
except ImportError:
    ODF_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-change-in-production")
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
MAX_CONTENT_LENGTH = 10 * 1024 * 1024 * 1024  # 10GB
ALLOWED_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'ico'},
    'documents': {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'},
}

@app.route("/preview/<path:filename>")
def preview_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file_extension = Path(filename).suffix.lower()

    if not os.path.exists(file_path):
        return f"File {filename} not found."

    try:
        if file_extension == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()

        elif file_extension == ".pdf" and PDF_AVAILABLE:
            with fitz.open(file_path) as doc:
                text = ""
                for page in doc:
                    text += page.get_text()
                return text

        elif file_extension in ['.doc', '.docx'] and DOCX_AVAILABLE:
            try:
                if file_extension == '.docx':
                    doc = Document(file_path)
                    text = []

                    for paragraph in doc.paragraphs:
                        line = paragraph.text.strip()
                        if line:
                            text.append(line)

                    for table in doc.tables:
                        for row in table.rows:
                            cells = [cell.text.strip() for cell in row.cells]
                            if any(cells):
                                text.append('\t'.join(cells))

                    return '\n'.join(text)
                else:
                    return "Preview not available for .doc files. Please download to view."
            except Exception as e:
                logger.error(f"Error processing Word document {file_path}: {str(e)}")
                return f"Error reading Word document: {str(e)}"

        elif file_extension in ['.xls', '.xlsx'] and EXCEL_AVAILABLE:
            try:
                if file_extension == '.xlsx':
                    workbook = openpyxl.load_workbook(file_path)
                    text = []
                    for sheet_name in workbook.sheetnames:
                        sheet = workbook[sheet_name]
                        text.append(f"=== Sheet: {sheet_name} ===")
                        for row in sheet.iter_rows(values_only=True):
                            row_text = '\t'.join([str(cell) if cell is not None else '' for cell in row])
                            if row_text.strip():
                                text.append(row_text)
                    workbook.close()
                    return '\n'.join(text)
                else:
                    return "Legacy .xls support not implemented."
            except Exception as e:
                logger.error(f"Error processing Excel file {file_path}: {str(e)}")
                return f"Error reading Excel document: {str(e)}"

        else:
            return "Preview not available for this file type."

    except Exception as e:
        logger.error(f"Unhandled error previewing file {file_path}: {str(e)}")
        return f"Error previewing file: {str(e)}"

@app.route("/")
def index():
    return "InventoryMaster API is running."

if __name__ == "__main__":
    app.run(debug=True)
