// File Manager JavaScript Functions

class FileManager {
    constructor() {
        this.currentRotation = 0;
        this.currentZoom = 1;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;
        
        this.init();
    }
    
    init() {
        // Initialize drag and drop for file uploads
        this.initDragAndDrop();
        
        // Initialize image viewer controls
        this.initImageViewer();
        
        // Initialize file selection
        this.initFileSelection();
        
        // Initialize tooltips
        this.initTooltips();
    }
    
    initDragAndDrop() {
        const uploadAreas = document.querySelectorAll('input[type="file"]');
        
        uploadAreas.forEach(area => {
            const container = area.closest('.card-body') || area.parentElement;
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                container.addEventListener(eventName, this.preventDefaults, false);
            });
            
            ['dragenter', 'dragover'].forEach(eventName => {
                container.addEventListener(eventName, () => this.highlight(container), false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                container.addEventListener(eventName, () => this.unhighlight(container), false);
            });
            
            container.addEventListener('drop', (e) => this.handleDrop(e, area), false);
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlight(container) {
        container.classList.add('drag-over');
    }
    
    unhighlight(container) {
        container.classList.remove('drag-over');
    }
    
    handleDrop(e, fileInput) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        fileInput.files = files;
        this.updateFileList(fileInput, files);
    }
    
    updateFileList(input, files) {
        const fileCount = files.length;
        const label = input.nextElementSibling || input.parentElement.querySelector('.form-text');
        
        if (label) {
            label.innerHTML = `<i class="fas fa-check-circle text-success me-1"></i>${fileCount} file(s) selected`;
            label.classList.add('text-success');
        }
    }
    
    initImageViewer() {
        // Add pan functionality to modal images
        const modalImages = document.querySelectorAll('.modal-image');
        
        modalImages.forEach(img => {
            img.addEventListener('mousedown', (e) => this.startDrag(e));
            img.addEventListener('mousemove', (e) => this.drag(e));
            img.addEventListener('mouseup', () => this.endDrag());
            img.addEventListener('mouseleave', () => this.endDrag());
            
            // Touch events for mobile
            img.addEventListener('touchstart', (e) => this.startDrag(e));
            img.addEventListener('touchmove', (e) => this.drag(e));
            img.addEventListener('touchend', () => this.endDrag());
        });
    }
    
    startDrag(e) {
        if (this.currentZoom <= 1) return;
        
        this.isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        this.dragStartX = clientX - this.dragCurrentX;
        this.dragStartY = clientY - this.dragCurrentY;
        
        e.target.style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        this.dragCurrentX = clientX - this.dragStartX;
        this.dragCurrentY = clientY - this.dragStartY;
        
        this.updateImageTransform();
    }
    
    endDrag() {
        this.isDragging = false;
        const images = document.querySelectorAll('.modal-image');
        images.forEach(img => {
            img.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
        });
    }
    
    initFileSelection() {
        // Multi-select functionality for bulk operations
        const fileCards = document.querySelectorAll('.file-card');
        
        fileCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleFileSelection(card);
                }
            });
        });
    }
    
    toggleFileSelection(card) {
        card.classList.toggle('selected');
        this.updateSelectionActions();
    }
    
    updateSelectionActions() {
        const selectedCards = document.querySelectorAll('.file-card.selected');
        const bulkActions = document.querySelector('.bulk-actions');
        
        if (selectedCards.length > 0) {
            if (bulkActions) bulkActions.style.display = 'block';
        } else {
            if (bulkActions) bulkActions.style.display = 'none';
        }
    }
    
    initTooltips() {
        // Initialize Bootstrap tooltips if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
    
    // Image manipulation functions
    rotateImage(degrees) {
        this.currentRotation += degrees;
        this.updateImageTransform();
    }
    
    zoomImage(factor) {
        const newZoom = this.currentZoom * factor;
        this.currentZoom = Math.max(0.5, Math.min(3, newZoom));
        
        if (this.currentZoom <= 1) {
            this.dragCurrentX = 0;
            this.dragCurrentY = 0;
        }
        
        this.updateImageTransform();
    }
    
    resetImage() {
        this.currentRotation = 0;
        this.currentZoom = 1;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;
        this.updateImageTransform();
    }
    
    updateImageTransform() {
        const img = document.querySelector('.modal-image');
        if (img) {
            const transform = `
                rotate(${this.currentRotation}deg) 
                scale(${this.currentZoom}) 
                translate(${this.dragCurrentX}px, ${this.dragCurrentY}px)
            `;
            img.style.transform = transform;
            img.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
        }
    }
    
    showImage(imageSrc, imageName) {
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('imageModalTitle');
        
        if (modalImage) {
            modalImage.src = imageSrc;
        }
        
        if (modalTitle) {
            modalTitle.textContent = imageName;
        }
        
        this.resetImage();
    }
    
    // Utility functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showNotification(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = this.createToast(message, type);
        
        toastContainer.appendChild(toast);
        
        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            // Remove toast after it's hidden
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        } else {
            // Fallback without Bootstrap
            setTimeout(() => {
                toast.remove();
            }, 5000);
        }
    }
    
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
        return container;
    }
    
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        
        const iconMap = {
            success: 'fa-check-circle text-success',
            error: 'fa-exclamation-triangle text-danger',
            warning: 'fa-exclamation-triangle text-warning',
            info: 'fa-info-circle text-info'
        };
        
        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas ${iconMap[type] || iconMap.info} me-2"></i>
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        return toast;
    }
    
    // File size validation
    validateFileSize(files, maxSizeGB = 10) {
        const maxSize = maxSizeGB * 1024 * 1024 * 1024;
        const invalidFiles = [];
        
        for (let file of files) {
            if (file.size > maxSize) {
                invalidFiles.push(file.name);
            }
        }
        
        return {
            valid: invalidFiles.length === 0,
            invalidFiles: invalidFiles,
            message: invalidFiles.length > 0 ? 
                `Files too large (max ${maxSizeGB}GB): ${invalidFiles.join(', ')}` : ''
        };
    }
}

// Global functions for backward compatibility
let fileManager;

document.addEventListener('DOMContentLoaded', function() {
    fileManager = new FileManager();
});

// Export functions to global scope
function rotateImage(degrees) {
    if (fileManager) fileManager.rotateImage(degrees);
}

function zoomImage(factor) {
    if (fileManager) fileManager.zoomImage(factor);
}

function resetImage() {
    if (fileManager) fileManager.resetImage();
}

function showImage(imageSrc, imageName) {
    if (fileManager) fileManager.showImage(imageSrc, imageName);
}

// File validation helper
function validateFiles(files) {
    if (fileManager) {
        return fileManager.validateFileSize(files);
    }
    return { valid: true, invalidFiles: [], message: '' };
}

// Progress tracking for large file uploads
function trackUploadProgress(form) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData(form);
    const progressBar = document.querySelector('.progress-bar');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (progressBar && uploadBtn) {
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
            }
        });
        
        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Upload Files';
                if (fileManager) {
                    fileManager.showNotification('Upload failed. Please try again.', 'error');
                }
            }
        });
        
        xhr.addEventListener('error', function() {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Upload Files';
            if (fileManager) {
                fileManager.showNotification('Upload error. Please try again.', 'error');
            }
        });
        
        xhr.open('POST', form.action);
        xhr.send(formData);
        
        return false; // Prevent default form submission
    }
    
    return true; // Allow default form submission if no progress elements found
}
