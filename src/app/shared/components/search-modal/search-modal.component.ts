import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.css']
})
export class SearchModalComponent implements OnInit {
  title: string = 'Seleccionar elemento';
  items: any[] = [];
  searchProps: string[] = [];
  displayProps: string[] = [];
  returnProp: string = '';
  searchTerm: string = '';
  filteredItems: any[] = [];
  selectedItems: any[] = [];
  multipleChoices: boolean = false;

  @Output() itemSelected = new EventEmitter<any>();
  @Output() itemsSelected = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<any>();

  constructor(
    private dialogRef: MatDialogRef<SearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      searchProps: string[],
      displayProps: string[],
      returnProp: string,
      title?: string,
      items: any[],
      multipleChoices?: boolean
    }
  ) {
    this.items = this.data.items;
    this.searchProps = this.data.searchProps;
    this.displayProps = this.data.displayProps;
    this.returnProp = this.data.returnProp;
    this.multipleChoices = this.data.multipleChoices || false;
    if (this.data.title) {
      this.title = this.data.title;
    }
  }

  ngOnInit() {
    this.filteredItems = [...this.items];
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item =>
        this.searchProps.some(prop =>
          item[prop].toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
  }

  selectItem(item: any) {
    const itemId = item[this.returnProp];

    if (this.multipleChoices) {
      if (this.selectedItems.includes(itemId)) {
        this.selectedItems = this.selectedItems.filter(id => id !== itemId);
      } else {
        this.selectedItems.push(itemId);
      }
    } else {
      this.itemSelected.emit(itemId);
      this.closeModal();
    }
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item[this.returnProp]);
  }

  closeModal() {
    if (this.multipleChoices) {
      this.itemsSelected.emit(this.selectedItems);
      this.dialogRef.close(this.selectedItems);
    } else {
      if (this.selectedItems.length > 0) {
        this.dialogRef.close(this.selectedItems[0]); // Solo el primer ítem si es selección única
      } else {
        this.dialogRef.close(); // Cierra el modal sin emitir nada si no se seleccionó ningún ítem
      }
    }
    this.modalClosed.emit();
  }
}
