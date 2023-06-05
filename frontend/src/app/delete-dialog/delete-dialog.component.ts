import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit {
  @Input() showModal?: boolean;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  constructor() {}
  ngOnInit(): void {
  }

    onCancel(): void {
        this.cancel.emit();
    }

    onConfirm(): void {
        // Perform some action here and then close the dialog
        this.confirm.emit();
    }

}
