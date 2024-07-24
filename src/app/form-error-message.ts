export class ErrorMessage {
  constructor(
    public forControl: string,
    public forValidator: string,
    public text: string
  ) {}
}

// Validation error messages
export const FormErrorMessage = [
  // Product
  new ErrorMessage('name', 'required', 'The name is required'),
  new ErrorMessage('description', 'minlength', 'The description must have at least 5 characters'),
  new ErrorMessage('description', 'required', 'The description is required'),
  new ErrorMessage('price', 'required', 'The price is required'),
  new ErrorMessage('price', 'pattern', 'The price only accepts numbers with two decimals'),
  new ErrorMessage('quantity', 'required', 'Quantity is required'),
  new ErrorMessage('quantity', 'min', 'Quantity must be at least 1'),
  new ErrorMessage('quantity', 'max', 'Quantity must be no more than 999'),
  new ErrorMessage('quantity', 'pattern', 'Quantity must be a whole number'),
  new ErrorMessage('category', 'required', 'It is required to select a category'),

  // Services
  new ErrorMessage('duration', 'required', 'Duration is required'),
  new ErrorMessage('duration', 'integerRange', 'Duration must be an integer between 5 and 480'),
  new ErrorMessage('user', 'required', 'Employee is required'),

  // Branches
  new ErrorMessage('phone', 'required', 'The phone number is required'),
  new ErrorMessage('phone', 'pattern', 'The phone number must be a number with at least 8 digits'),
  new ErrorMessage('address', 'required', 'The address is required'),
  new ErrorMessage('email', 'required', 'The email is required'),
  new ErrorMessage('email', 'email', 'The email format is invalid'),
  new ErrorMessage('email', 'emailDomain', 'The email must end with .com'),
  new ErrorMessage('users', 'required', 'At least one user must be selected'),
  new ErrorMessage('users', 'minSelection', 'At least one user must be selected'),

  // Schedules form validation messages
  new ErrorMessage('startDate', 'required', 'Start Date is required'),
  new ErrorMessage('startDate', 'invalidDate', 'Start Date cannot be in the past'),
  new ErrorMessage('endDate', 'required', 'End Date is required'),
  new ErrorMessage('endDate', 'invalidDate', 'End Date cannot be in the past'),
  new ErrorMessage('endDate', 'dateMismatch', 'End date cannot be before start date'),
  new ErrorMessage('endDate', 'minDuration', 'End date must be at least 1 hour after start date'),
  new ErrorMessage('branchId', 'required', 'Branch is required'),
];
