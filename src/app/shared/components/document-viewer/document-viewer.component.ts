import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";

export type DocumentType = "pdf" | "image" | "unknown";

@Component({
  selector: "app-document-viewer",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./document-viewer.component.html",
  styleUrls: ["./document-viewer.component.css"],
})
export class DocumentViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() documentUrl = "";
  @Input() showControls = true;
  @Output() close = new EventEmitter<void>();

  safeUrl: SafeResourceUrl | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = "";
  documentType: DocumentType = "unknown";

  // Viewing state
  currentPage = 1;
  totalPages = 1;
  zoomLevel = 100;
  isFullscreen = false;
  showSidebar = false;
  isMobile = false;
  documentName = "";

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.checkMobileView();
    // Set fullscreen mode for popup behavior
    this.isFullscreen = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["documentUrl"] && this.documentUrl) {
      this.loadDocument();
    }
  }

  ngOnDestroy(): void {
    // Re-enable body scrolling
    document.body.style.overflow = "";
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener("window:resize")
  onResize(): void {
    this.checkMobileView();
  }

  @HostListener("document:keydown.escape")
  handleEscapeKey(): void {
    this.closeViewer();
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.showSidebar = false;
    }
  }

  private loadDocument(): void {
    try {
      this.isLoading = true;
      this.hasError = false;

      // Detect document type based on URL extension
      this.detectDocumentType();
      this.documentName = this.getDocumentName();

      // For PDFs, we'll use Google Docs Viewer as a safer approach
      if (this.documentType === 'pdf') {
        const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(this.documentUrl)}&embedded=true`;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsViewerUrl);
      } else {
        // For images or other content
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentUrl);
      }

      // Simulate loading delay
      setTimeout(() => {
        this.isLoading = false;
        this.totalPages = this.documentType === "pdf" ? this.getRandomPages() : 1;
      }, 1000);
    } catch (error) {
      this.handleError(error);
    }
  }

  private getRandomPages(): number {
    return Math.floor(Math.random() * 20) + 1; // 1-20 pages
  }

  private detectDocumentType(): void {
    const url = this.documentUrl.toLowerCase();

    if (url.endsWith(".pdf") || url.includes("pdf") || url.includes("application/pdf")) {
      this.documentType = "pdf";
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].some(ext => url.endsWith(ext))) {
      this.documentType = "image";
    } else {
      this.documentType = "unknown";
    }
  }

  private handleError(error: any): void {
    console.error("Error loading document:", error);
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = "Failed to load document. Please check the URL and try again.";
  }

  closeViewer(): void {
    // Re-enable body scrolling
    document.body.style.overflow = "";
    this.close.emit();
  }

  toggleFullscreen(): void {
    // This is just for toggling the UI fullscreen look
    if (!this.isFullscreen) {
      this.isFullscreen = true;
    }
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  zoomIn(): void {
    if (this.zoomLevel < 200) {
      this.zoomLevel += 25;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 25;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 100;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  downloadDocument(): void {
    window.open(this.documentUrl, "_blank");
  }

  openInNewTab(): void {
    window.open(this.documentUrl, "_blank");
  }

  private getDocumentName(): string {
    const urlParts = this.documentUrl.split("/");
    let fileName = urlParts[urlParts.length - 1];

    // Remove query parameters if present
    if (fileName.includes("?")) {
      fileName = fileName.split("?")[0];
    }

    // Try to decode the filename
    try {
      fileName = decodeURIComponent(fileName);
    } catch (e) {
      // If decoding fails, use the original filename
    }

    return fileName;
  }
}
