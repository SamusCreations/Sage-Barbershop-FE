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
  new ErrorMessage('name', 'required', 'Name is required'),
  new ErrorMessage('description', 'minlength', 'Description must have at least 5 characters'),
  new ErrorMessage('description', 'required', 'Description is required'),
  new ErrorMessage('price', 'required', 'Price is required'),
  new ErrorMessage('price', 'pattern', 'Price only accepts numbers with two decimals'),
  new ErrorMessage('quantity', 'required', 'Quantity is required'),
  new ErrorMessage('quantity', 'min', 'Quantity must be at least 1'),
  new ErrorMessage('quantity', 'max', 'Quantity must be no more than 999'),
  new ErrorMessage('quantity', 'pattern', 'Quantity must be a whole number'),
  new ErrorMessage('category', 'required', 'Category is required'),

  // Services
  new ErrorMessage('duration', 'required', 'Duration is required'),
  new ErrorMessage('duration', 'integerRange', 'Duration must be an integer between 5 and 480'),
  new ErrorMessage('user', 'required', 'Employee is required'),

  // Branches
  new ErrorMessage('phone', 'required', 'phone number is required'),
  new ErrorMessage('phone', 'pattern', 'phone number must be a number with at least 8 digits'),
  new ErrorMessage('address', 'required', 'address is required'),
  new ErrorMessage('email', 'required', 'email is required'),
  new ErrorMessage('email', 'email', 'email format is invalid'),
  new ErrorMessage('email', 'emailDomain', 'email must end with .com'),
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

  // Login form validation messages
  new ErrorMessage('email', 'required', 'email address is required'),
  new ErrorMessage('email', 'email', 'email format is invalid'),
  new ErrorMessage('password', 'required', 'password is required'),
  new ErrorMessage('password', 'minlength', 'password must have at least 8 characters'),
  new ErrorMessage('confirmPassword', 'required', 'Confirm password is required'),
  new ErrorMessage('confirmPassword', 'minlength', 'Password must have at least 8 characters'),
  new ErrorMessage('confirmPassword', 'mustMatch', 'Both passwords must match'),
  new ErrorMessage('surname', 'required', 'Surname is required'),
  new ErrorMessage('birthdate', 'required', 'Birthdate is required'),
  new ErrorMessage('birthdate', 'invalidDate', 'Birthdate cannot be in the future'),
  new ErrorMessage('role', 'required', 'Role is required'),

    // Reservations form validation messages
    new ErrorMessage('date', 'required', 'Start Date is required'),
    new ErrorMessage('date', 'invalidDate', 'Date cannot be in the past'),
    new ErrorMessage('time', 'required', 'time is required'),
    new ErrorMessage('serviceId', 'required', 'Service is required'),
    new ErrorMessage('userId', 'required', 'User is required'),
];
