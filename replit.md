# File Hosting Service

## Overview

This is a professional file hosting service built with Flask that allows users to upload, organize, and manage various types of files. The application supports multiple document formats including PDFs, Word documents, Excel files, PowerPoint presentations, and OpenDocument formats. It features a modern glass morphism UI design with category-based file organization and advanced document viewing capabilities.

## System Architecture

The application follows a traditional Flask web application architecture with the following components:

- **Frontend**: Server-side rendered HTML templates using Jinja2 with Bootstrap 5 styling and custom CSS/JavaScript
- **Backend**: Flask web framework with PostgreSQL database integration using Flask-SQLAlchemy
- **Database**: PostgreSQL database for tracking files, categories, and upload sessions with automatic fallback to SQLite
- **File Storage**: Local file system organized by categories and subcategories in `static/uploads/`
- **Document Processing**: Multiple specialized libraries for viewing different document types
- **Deployment**: Gunicorn WSGI server with autoscale deployment target on Replit

## Key Components

### File Upload System
- **Multi-file upload support** with drag-and-drop interface using JavaScript
- **File type validation** for images, documents, archives, videos, and audio files
- **Category-based organization** with optional subcategories for hierarchical structure
- **File size limits** with 10GB maximum per file (configurable through Flask settings)
- **Secure filename handling** using Werkzeug's secure_filename utility

### Document Processing Engine
- **PDF viewing** using PyMuPDF (fitz) for text extraction and rendering
- **Word document support** (.docx) using python-docx library for content extraction
- **Excel file support** (.xlsx) using openpyxl for spreadsheet data processing
- **PowerPoint support** (.pptx) using python-pptx with slide text extraction capabilities
- **OpenDocument support** (.odt) using odfpy for OpenOffice document processing
- **Graceful degradation** when optional document libraries are not available
- **MIME type detection** for proper file serving and browser handling

### File Management Features
- **Category browsing** with breadcrumb navigation for intuitive file organization
- **File preview and viewing** with specialized viewers for different file formats
- **Bulk operations** including category deletion and ZIP archive downloads
- **File metadata tracking** with upload timestamps and file information
- **Directory structure management** with automatic cleanup of empty directories

### User Interface Components
- **Responsive design** using Bootstrap 5 grid system and components
- **Glass morphism styling** with gradient backgrounds and blur effects
- **Interactive file viewer** with zoom, rotation, and pan controls for images
- **Modal-based interactions** for uploads, confirmations, and file operations
- **Progress indicators** for file upload operations
- **Flash message system** for user feedback and error handling

## Data Flow

1. **File Upload Process**: Users select files through the web interface and specify target categories
2. **Server Processing**: Flask validates file types, creates directory structure, and secures filenames
3. **File Storage**: Files are saved to hierarchical directory structure under `static/uploads/`
4. **Document Processing**: Text extraction and metadata generation for supported document types
5. **File Serving**: Files are served directly from the file system with appropriate MIME types and headers
6. **Category Management**: Dynamic category creation and organization based on user input

## External Dependencies

### Python Libraries
- **Flask**: Core web framework for request handling and templating
- **Flask-SQLAlchemy**: Database ORM for PostgreSQL integration and file metadata management
- **Flask-CORS**: Cross-origin resource sharing support for API endpoints
- **Werkzeug**: WSGI utilities for secure file handling and HTTP utilities
- **Gunicorn**: Production WSGI server for deployment
- **psycopg2-binary**: PostgreSQL database adapter for Python
- **PyMuPDF (fitz)**: PDF processing and text extraction (optional)
- **python-docx**: Microsoft Word document processing (optional)
- **openpyxl**: Excel file processing and data extraction (optional)
- **python-pptx**: PowerPoint presentation processing (optional)
- **odfpy**: OpenDocument format support (optional)

### Frontend Dependencies (CDN)
- **Bootstrap 5.3.0**: UI framework and responsive grid system
- **Font Awesome 6.4.0**: Icon library for consistent iconography
- **Custom CSS/JavaScript**: Enhanced user experience and file management features

### System Dependencies (Nix)
- **PostgreSQL**: Database system (prepared for future database integration)
- **MuPDF**: PDF rendering library and dependencies
- **OpenSSL**: Cryptographic library support
- **Image processing libraries**: freetype, harfbuzz, libjpeg_turbo for document rendering

## Deployment Strategy

### Replit Environment
- **Python 3.11** runtime environment with Nix package management
- **Autoscale deployment** target for automatic scaling based on traffic
- **Gunicorn server** with bind to 0.0.0.0:5000 for external access
- **Hot reload** support during development with --reload flag
- **Port configuration** with proper external port mapping

### File System Architecture
- **Static uploads directory** at `static/uploads/` for file storage
- **Category-based organization** with hierarchical subdirectories
- **Automatic directory creation** for new categories and subcategories
- **File serving** through Flask's static file handling with proper MIME types

### Production Considerations
- **Error handling** with try-catch blocks for optional library imports
- **Logging configuration** for debugging and monitoring
- **File size limits** to prevent storage abuse
- **Security measures** including filename sanitization and MIME type validation

## Database Schema

### Categories Table
- **id**: Primary key
- **name**: Category name
- **path**: Full category path for file system organization
- **parent_id**: Foreign key to parent category (for subcategories)
- **created_at**: Category creation timestamp

### Files Table
- **id**: Primary key
- **filename**: Secure filename used for storage
- **original_filename**: Original filename from upload
- **file_path**: Full file system path
- **file_size**: File size in bytes
- **file_type**: File type category (images, documents, etc.)
- **mime_type**: MIME type for proper browser handling
- **category_id**: Foreign key to categories table
- **upload_date**: File upload timestamp
- **last_accessed**: Last access timestamp
- **download_count**: Number of times downloaded

### Upload Sessions Table
- **id**: Primary key
- **session_id**: Unique session identifier
- **total_files**: Number of files in upload batch
- **successful_uploads**: Number of successful uploads
- **failed_uploads**: Number of failed uploads
- **total_size**: Total size of uploaded files
- **start_time**: Upload session start time
- **end_time**: Upload session completion time
- **ip_address**: Client IP address
- **user_agent**: Client browser information

## Changelog

- June 22, 2025: Initial setup with file system-based storage
- June 22, 2025: Added PostgreSQL database integration with Flask-SQLAlchemy
- June 22, 2025: Implemented database-driven category and file management
- June 22, 2025: Added upload session tracking and file metadata storage

## User Preferences

Preferred communication style: Simple, everyday language.