import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // For forms
import { Event } from '../../models/event.model'; // Use your Event model

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Import necessary modules
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnChanges {
  @Input() eventToEdit?: Event | null = null; // Input for editing existing event
  @Input() isLoading = false; // Input to show loading state
  @Input() errorMessage: string | null = null; // Input to display errors from parent

  @Output() formSubmitted = new EventEmitter<Partial<Event>>(); // Emits form data
  @Output() cancelled = new EventEmitter<void>(); // Emits on cancel

  eventForm: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      id: [null], // Hidden field to hold ID during edit
      title: ['', Validators.required],
      description: [''],
      // Use datetime-local input type, requires conversion later
      start_time_local: ['', Validators.required],
      end_time_local: [''],
      location: [''] // URL or physical location
    });
  }

  ngOnInit(): void {
    this.updateForm();
  }

  // Update form when input changes (specifically for eventToEdit)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventToEdit']) {
      this.updateForm();
    }
  }

  updateForm(): void {
    if (this.eventToEdit) {
      this.isEditMode = true;
      this.eventForm.patchValue({
        id: this.eventToEdit.id,
        title: this.eventToEdit.title,
        description: this.eventToEdit.description,
        // Convert ISO date string to 'YYYY-MM-DDTHH:mm' format for datetime-local input
        start_time_local: this.formatDateForInput(this.eventToEdit.start_time),
        end_time_local: this.eventToEdit.end_time ? this.formatDateForInput(this.eventToEdit.end_time) : '',
        location: this.eventToEdit.location
      });
    } else {
      this.isEditMode = false;
      this.eventForm.reset(); // Clear form for new event
    }
  }

  // Helper to format ISO string for datetime-local input
  private formatDateForInput(isoString: string): string {
    if (!isoString) return '';
    try {
        // Convert UTC ISO string to Date object, then format LOCALLY
        const date = new Date(isoString);
        // Get parts (adjusting for timezone is tricky here, this formats based on browser's local time)
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return ''; // Handle potential parsing errors
    }
  }

  // Helper to convert local datetime string back to UTC ISO string for backend
  private formatInputDateToISO(localDateTime: string | null | undefined): string | null {
    if (!localDateTime) return null;
    try {
      // Create Date object from local time string, it assumes browser's timezone
      const localDate = new Date(localDateTime);
      // Convert to UTC ISO string
      return localDate.toISOString();
    } catch (e) {
      console.error("Error converting date to ISO:", e);
      return null; // Or handle invalid date input appropriately
    }
  }


  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formValues = this.eventForm.value;
    const processedData: Partial<Event> = {
        // Include ID only if it exists (edit mode)
        ...(formValues.id && { id: formValues.id }),
        title: formValues.title,
        description: formValues.description,
        location: formValues.location,
        // Convert local datetime back to ISO UTC string for the backend
        start_time: this.formatInputDateToISO(formValues.start_time_local) || '', // Ensure it's not null if required
        end_time: this.formatInputDateToISO(formValues.end_time_local), // Can be null if optional
    };


    // Filter out null/undefined end_time if necessary, depending on backend requirements
    // if (!processedData.end_time) {
    //    delete processedData.end_time;
    // }

    this.formSubmitted.emit(processedData);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  // Helper for template validation checks
  get formControls() { return this.eventForm.controls; }
}