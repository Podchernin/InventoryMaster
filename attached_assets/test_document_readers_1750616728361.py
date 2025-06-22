#!/usr/bin/env python3
"""
Test script for document readers
"""
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, '.')

def test_imports():
    """Test if all document processing libraries are available"""
    print("Testing document processing imports...")
    
    try:
        from docx import Document
        print("✓ python-docx imported successfully")
    except ImportError as e:
        print(f"✗ python-docx import failed: {e}")

    try:
        import openpyxl
        print("✓ openpyxl imported successfully")
    except ImportError as e:
        print(f"✗ openpyxl import failed: {e}")

    try:
        import fitz
        print("✓ PyMuPDF imported successfully")
    except ImportError as e:
        print(f"✗ PyMuPDF import failed: {e}")

    try:
        from pptx import Presentation
        print("✓ python-pptx imported successfully")
    except ImportError as e:
        print(f"✗ python-pptx import failed: {e}")

    try:
        from odf import text, teletype
        from odf.opendocument import load
        print("✓ odfpy imported successfully")
    except ImportError as e:
        print(f"✗ odfpy import failed: {e}")

def test_extract_function():
    """Test the extract_text_from_file function"""
    print("\nTesting extract_text_from_file function...")
    
    try:
        from app import extract_text_from_file
        
        # Create a test text file
        test_file = Path("test.txt")
        test_file.write_text("This is a test document.\nSecond line of text.")
        
        result = extract_text_from_file(test_file)
        print(f"Text file extraction result: {result[:50]}...")
        
        # Clean up
        test_file.unlink()
        
        print("✓ extract_text_from_file function works")
        
    except Exception as e:
        print(f"✗ extract_text_from_file function failed: {e}")

if __name__ == "__main__":
    test_imports()
    test_extract_function()