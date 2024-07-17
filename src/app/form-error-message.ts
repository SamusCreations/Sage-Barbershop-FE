export class ErrorMessage {
    constructor(
      public forControl: string,
      public forValidator: string,
      public text: string
    ) { }
  }
//Mensajes de errores de validación
export const FormErrorMessage = [
  new ErrorMessage('name', 'required', 'El name es requerido'),
  new ErrorMessage('description', 'minlength', 'El name debe tener 3 carácteres mínimo'),
  new ErrorMessage('description', 'required', 'La descripción es requerida'),
  new ErrorMessage('price', 'required', 'El price es requerido'),
  new ErrorMessage('price', 'pattern', 'El price solo acepta números con dos decimales'),
  new ErrorMessage('quantity', 'required', 'quantity es requerido'),
  new ErrorMessage('category', 'required', 'Es requerido que seleccione un category'),
];