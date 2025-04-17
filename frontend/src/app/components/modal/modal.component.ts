import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule], // Import CommonModule for *ngIf
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal Title';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md'; // Control modal size

  @Output() close = new EventEmitter<void>();

  // Close modal on Escape key press
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeydownHandler(event: KeyboardEvent) {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  // Prevent closing when clicking inside the modal content
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  get modalSizeClass(): string {
      switch(this.size) {
          case 'sm': return 'modal-sm';
          case 'lg': return 'modal-lg';
          case 'xl': return 'modal-xl';
          default: return ''; // Default (medium) has no specific size class needed usually
      }
  }
}