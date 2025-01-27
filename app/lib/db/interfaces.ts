//import crypto from 'crypto';

export interface DatabaseInterface {
  // Métodos de autenticación
  isValidUser(key: string): Promise<boolean>
  getData(key: string): Promise<AuthenticatedUserData | null>
  
  // Métodos existentes modificados para requerir clave
  getUsers(key?: string): Promise<User[]>
  createUser(key: string, user: User): Promise<void>
  updateUser(key: string, user: User): Promise<void>
  deleteUser(key: string, userId: string): Promise<void>

  getBills(key: string): Promise<Bill[]>
  createBill(key: string, bill: Bill): Promise<void>
  updateBill(key: string, bill: Bill): Promise<void>
  deleteBill(key: string, billId: string): Promise<void>
  getBillsByClientId(key: string, clientid: string): Promise<Bill[]>
  login(email: string, password: string): Promise<string | null>
  getDeposits(key: string): Promise<Deposit[]>
  createDeposit(key: string, deposit: Deposit): Promise<void>
  updateDeposit(key: string, deposit: Deposit): Promise<void>
  deleteDeposit(key: string, depositId: string): Promise<void>
  getDepositsByClientId(key: string, clientid: string): Promise<Deposit[]>
  
  getClients(key: string): Promise<Client[]>
  createClient(key: string, client: Client): Promise<void>
  updateClient(key: string, client: Client): Promise<void>
  deleteClient(key: string, clientid: string): Promise<void>
  
  getProducts(key: string): Promise<Product[]>
  createProduct(key: string, producto: Product): Promise<void>
  updateProduct(key: string, producto: Product): Promise<void>
  deleteProduct(key: string, productId: string): Promise<void>

  getClientBalance(key: string, clientid: string): Promise<number>
  searchBills(key: string, query: string): Promise<Bill[]>
  searchDeposits(key: string, query: string): Promise<Deposit[]>
  getBillsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Bill[]>
  getDepositsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Deposit[]>
}

export interface User {
  id: string
  email: string
  password: string
  tier: 'basic' | 'advanced' | 'administrator'
}

export interface Bill {
  id: string
  clientid: string
  products: { 
    [productId: string]: BillProduct[] 
  }
  date: string
  identifier: string
}

export interface BillProduct {
  amount: number
  price: number
  extraDetails: string
}

export interface Deposit {
  id: string
  clientid: string
  currency: 'PEN' | 'USD'
  changueamount: number
  amount: number
  operationcode?: string
  date: string
}

export interface Client {
  id: string
  name: string
  prices: { [productId: string]: number }
}

export interface Product {
  id: string
  name: string
  genericprice: number
}

export interface AuthenticatedUserData {
  userName: string
  tier: 'basic' | 'advanced' | 'administrator'
}

