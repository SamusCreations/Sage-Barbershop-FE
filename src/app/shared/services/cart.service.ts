import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// Definir clase con las propiedades que es necesario que gestione el carrito
export class ItemCart {
  idProduct: number;
  idService: number;
  name: string;
  product: any;
  service: any;
  quantity: number;
  price: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart = new BehaviorSubject<ItemCart[]>(null);
  private keyName = 'order';
  public currentDataCart$ = this.cart.asObservable();
  public qtyItems = new Subject<number>();
  public total = new Subject<number>();

  constructor() {
    //Obtener los datos de la variable order guardada en el localStorage
    this.cart = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem(this.keyName))
    );

    //Establecer un observable para los datos del carrito
    this.currentDataCart$ = this.cart.asObservable();
  }

  saveCart(): void {
    localStorage.setItem(this.keyName, JSON.stringify(this.cart.getValue()));
  }

  addToCart(item: any, increase: boolean = true) {
    const newItem = new ItemCart();
  
    if (item.hasOwnProperty('category')) {
      newItem.idProduct = item.id;
      newItem.product = item;
    } else {
      newItem.idService = item.id;
      newItem.service = item;
    }
  
    newItem.name = item.name;
    newItem.price = item.price;
    newItem.quantity = 1;
    newItem.subtotal = newItem.price * newItem.quantity;
  
    let listCart = this.cart.getValue();
  
    if (listCart) {
      let objIndex = -1;
  
      if (newItem.hasOwnProperty('idProduct')) {
        objIndex = listCart.findIndex(
          (obj) =>
            obj.idProduct === newItem.idProduct &&
            obj.hasOwnProperty('idProduct')
        );
      } else if (newItem.hasOwnProperty('idService')) {
        objIndex = listCart.findIndex(
          (obj) =>
            obj.idService === newItem.idService &&
            obj.hasOwnProperty('idService')
        );
      }
  
      if (objIndex != -1) {
        if (increase) {
          listCart[objIndex].quantity += 1;
        } else {
          listCart[objIndex].quantity -= 1;
          if (listCart[objIndex].quantity <= 0) {
            this.removeFromCart(newItem);
            return;
          }
        }
        newItem.quantity = listCart[objIndex].quantity;
        listCart[objIndex].subtotal = newItem.price * newItem.quantity;
      } else {
        if (increase) {
          listCart.push(newItem);
        }
      }
    } else {
      listCart = [];
      if (increase) {
        listCart.push(newItem);
      }
    }
  
    this.cart.next(listCart);
    this.qtyItems.next(this.quantityItems());
    this.total.next(this.calculateTotal());
    this.saveCart();
  }
  

  //Elimina un elemento del carrito
  public removeFromCart(newData: ItemCart) {
    let listCart = this.cart.getValue();
    let objIndex = -1;
    if (listCart) {
      if (newData.hasOwnProperty('idProduct')) {
        objIndex = listCart.findIndex(
          (obj) =>
            obj.idProduct === newData.idProduct &&
            obj.hasOwnProperty('idProduct')
        );
      } else if (newData.hasOwnProperty('idService')) {
        objIndex = listCart.findIndex(
          (obj) =>
            obj.idService === newData.idService &&
            obj.hasOwnProperty('idService')
        );
      }
      if (objIndex != -1) {
        listCart.splice(objIndex, 1);
        this.cart.next(listCart);
        this.qtyItems.next(this.quantityItems());
        this.total.next(this.calculateTotal());
        this.saveCart();
      }
    }
  }

  //Obtener todos los items del carrito
  get getItems() {
    return this.cart.getValue();
  }

  //Gestiona el conteo de los items del carrito como un Observable
  get countItems(): Observable<number> {
    this.qtyItems.next(this.quantityItems());
    return this.qtyItems.asObservable();
  }

  quantityItems() {
    let listCart = this.cart.getValue();
    let sum = 0;
    if (listCart != null) {
      //Sumando las cantidades de cada uno de los items del carrito
      listCart.forEach((obj) => {
        sum += obj.quantity;
      });
    }
    return sum;
  }

  //Calcula y retorna el total de los items del carrito
  public calculateTotal(): number {
    let totalCalc = 0;
    let listCart = this.cart.getValue();
    if (listCart != null) {
      listCart.forEach((item: ItemCart, index) => {
        totalCalc += item.subtotal;
      });
    }

    return totalCalc;
  }
  get getTotal(): Observable<number> {
    this.total.next(this.calculateTotal());
    return this.total.asObservable();
  }

  //Borra toda los items del carrito
  public deleteCart() {
    this.cart.next(null);
    this.qtyItems.next(0);
    this.total.next(0);
    this.saveCart();
  }
}
