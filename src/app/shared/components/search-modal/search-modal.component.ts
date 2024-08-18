import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.css']
})
export class SearchModalComponent implements OnInit {
  title: string = 'Seleccionar elemento';
  lists: { list: any[], name: string }[] = [];
  searchProps: string[] = [];
  displayProps: string[] = [];
  returnProp: string = '';
  searchTerm: string = '';
  filteredLists: { list: any[], name: string }[] = [];
  selectedItems: { [key: string]: any }[] = [];
  multipleChoices: boolean = false;
  multipleLists: boolean = false;

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
      lists: { list: any[], name: string }[],
      multipleChoices?: boolean,
      multipleLists?: boolean
    }
  ) {
    this.lists = this.data.lists || [];
    this.searchProps = this.data.searchProps;
    this.displayProps = this.data.displayProps;
    this.returnProp = this.data.returnProp;
    this.multipleChoices = this.data.multipleChoices || false;
    this.multipleLists = this.data.multipleLists || false;

    if (this.data.title) {
      this.title = this.data.title;
    }
  }

  ngOnInit() {
    this.filteredLists = this.lists.map(list => ({
      name: list.name,
      list: [...list.list]
    }));
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {
      this.filteredLists = this.lists.map(list => ({
        name: list.name,
        list: [...list.list]
      }));
    } else {
      this.filteredLists = this.lists.map(list => ({
        name: list.name,
        list: list.list.filter(item =>
          this.searchProps.some(prop =>
            item[prop].toString().toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        )
      }));
    }
  }

  selectItem(item: any, listName: string) {
    const itemData: { [key: string]: any } = {
      [this.returnProp]: item[this.returnProp],
      listFrom: listName
    };

    if (this.multipleChoices) {
      const existingIndex = this.selectedItems.findIndex(
        selectedItem => selectedItem[this.returnProp] === itemData[this.returnProp] && selectedItem['listFrom'] === listName
      );

      if (existingIndex > -1) {
        this.selectedItems.splice(existingIndex, 1);
      } else {
        this.selectedItems.push(itemData);
      }
    } else {
      this.itemSelected.emit(itemData);
      this.closeModal();
    }
  }

  isSelected(item: any, listName: string): boolean {
    return this.selectedItems.some(
      selectedItem => selectedItem[this.returnProp] === item[this.returnProp] && selectedItem['listFrom'] === listName
    );
  }

  closeModal() {
    if (this.multipleChoices) {
      this.itemsSelected.emit(this.selectedItems);
      this.dialogRef.close(this.selectedItems);
    } else {
      if (this.selectedItems.length > 0) {
        this.dialogRef.close(this.selectedItems[0]);
      } else {
        this.dialogRef.close();
      }
    }
    this.modalClosed.emit();
  }
}
